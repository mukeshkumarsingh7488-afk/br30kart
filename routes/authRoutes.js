const express = require("express");
const router = express.Router();
const User = require("../models/User");
const upload = require("../middleware/upload");
const sellerUpload = require("../middleware/sellerUpload");
const authController = require("../controllers/authController");
const generateProfessionalCert = require("../utils/generateProfessionalCert");
const auth = require("../middleware/auth");
const cloudinary = require("cloudinary").v2;
const { sendEmail, vipCertTemplate } = require("../utils/emailTemplate");

const Certificate = require("../models/Certificate");

router.post("/register", authController.register);
router.post("/verify-otp", authController.verifyOTP);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.get("/profile", auth, authController.getProfile);
router.put(
  "/update-profile",
  auth,
  upload.single("profilePic"),
  authController.updateProfile,
);

// --- 🔥 Naye Seller Routes (Paths change kar diye taaki takraav na ho) ---

// 1. Send OTP (Ab error nahi aayega kyunki authController. laga diya hai)
router.post("/seller/send-otp", authController.sendOTP);

// 2. Verify OTP (Ise 'seller-verify' kar diya taaki upar wale se alag rahe)
router.post("/seller/verify-otp", authController.verifyOTP);

// 3. Final Seller Register
router.post(
  "/seller/register",
  sellerUpload.fields([
    { name: "aadharFront", maxCount: 1 },
    { name: "aadharBack", maxCount: 1 },
    { name: "bankDoc", maxCount: 1 },
  ]),
  authController.sellerRegister,
); // Yahan bhi authController. lagana zaroori tha

// 🏆 UPGRADED ROUTE: Claim Certificate + Automatic Elite Mail
router.post("/claim-certificate", auth, async (req, res) => {
  console.log(
    "🚀 [STEP 1] Certificate request received for User ID:",
    req.user.id,
  );

  try {
    // 1. User fetch
    const user = await User.findById(req.user.id);
    if (!user) {
      console.log("❌ [ERROR] User record not found in Atlas");
      return res.status(404).json({ success: false, msg: "User nahi mila!" });
    }

    // 2. ID Setup
    const fullName = req.body.fullName || user.name;
    const certId =
      user.certificateData?.certId ||
      `BR30-${user._id.toString().substring(18).toUpperCase()}`;
    const courseName = req.body.courseName || "Elite Trading Masterclass";

    console.log(
      `🎓 [STEP 2] Generating PDF for: ${fullName} | CertNo: ${certId}`,
    );

    // 3. Generate PDF Buffer
    const pdfBuffer = await generateProfessionalCert(
      user,
      fullName,
      certId,
      courseName,
    );
    console.log("✅ [STEP 3] PDF Buffer Created. Size:", pdfBuffer.length);

    // 4. Cloudinary Upload
    console.log("📤 [STEP 4] Uploading to Cloudinary...");
    const uploadRes = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          folder: "BR30_Certificates",
          public_id: `cert_${user._id}`,
        },
        (err, result) => (result ? resolve(result) : reject(err)),
      );
      stream.end(pdfBuffer);
    });
    console.log("✅ [STEP 5] Cloudinary Success. URL:", uploadRes.secure_url);

    // 5. 🔥 FIX: SYNC USER MODEL (Dot Notation use kar rahe hain taaki save pakka ho)
    console.log("💾 [STEP 6] Syncing User Collection...");
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          isCertified: true,
          "certificateData.fullName": fullName,
          "certificateData.certId": certId,
          "certificateData.downloadUrl": uploadRes.secure_url,
          "certificateData.issueDate": new Date(),
          "certificateData.mobile": req.body.mobile || "",
        },
      },
      { new: true, runValidators: true },
    );

    if (updatedUser)
      console.log("✅ [STEP 7] User Model updated successfully!");

    // 6. SYNC CERTIFICATE MODEL
    await Certificate.findOneAndUpdate(
      { certId: certId },
      {
        userId: user._id,
        name: fullName,
        course: courseName,
        certId: certId,
        downloadUrl: uploadRes.secure_url,
        date: new Date(),
      },
      { upsert: true, new: true },
    );
    console.log("✅ [STEP 8] Certificates Collection Synced!");

    // 7. 📧 SEND MAIL
    console.log("📧 [STEP 9] Initializing Email Process...");
    try {
      const { sendEmail, vipCertTemplate } = require("../utils/emailTemplate");

      const emailResult = await sendEmail({
        to: user.email,
        subject: "🏆 CONGRATULATIONS! YOUR VIP CERTIFICATE IS READY",
        html: vipCertTemplate(user.name, uploadRes.secure_url, certId),
      });

      console.log("✅ [STEP 10] Email dispatched successfully!");
    } catch (mailErr) {
      console.error("⚠️ [MAIL FAIL] Error:", mailErr.message);
    }

    // 8. FINAL RESPONSE
    res.status(200).json({
      success: true,
      certId,
      downloadUrl: uploadRes.secure_url,
      msg: "Elite Certificate system completed successfully! 🚀",
    });
  } catch (err) {
    console.error("❌ [CRITICAL ERROR]:", err.message);
    if (!res.headersSent) {
      res
        .status(500)
        .json({ success: false, msg: "Server Side Issue: " + err.message });
    }
  }
});

// niche ye naya route add karo
// Upgraded Verification Route v2.5 (Atlas + Cloudinary Sync)
router.get("/verify-certificate/:id", async (req, res) => {
  try {
    const certId = req.params.id.trim();

    // 1. Database mein Certificate dhoondo
    // Note: Humein 'downloadUrl' seedha Atlas se uthana hai
    const cert = await Certificate.findOne({ certId: certId });

    if (!cert) {
      return res.status(404).json({
        success: false,
        message: "Invalid Certificate ID! ❌",
      });
    }

    // 2. Response bhejo (Asli Cloudinary link ke saath)
    res.json({
      success: true,
      studentName: cert.name.toUpperCase(),
      course: cert.course,
      issueDate: cert.date,
      // 🔥 LOCALHOST HATA DIYA: Ab seedha Atlas me se Cloudinary ka secure_url jayega
      downloadUrl: cert.downloadUrl,
    });

    console.log(`✅ Certificate Verified: ${certId} for ${cert.name}`);
  } catch (err) {
    console.error("❌ Verification Error:", err.message);
    res.status(500).json({ success: false, msg: "Internal Server Error" });
  }
});

module.exports = router;
