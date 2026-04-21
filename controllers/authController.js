const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const cloudinary = require("cloudinary").v2;

const {
  sendEmail,
  registerOtpTemplate,
  forgotPasswordTemplate,
  sellerForgotPasswordTemplate,
  sellerOtpTemplate,
} = require("../utils/emailTemplate");

// --- REGISTER & SEND OTP ---

// 🔥 REGISTER CONTROLLER (FULL CLEAN)
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ msg: "All fields are required!" });
    }

    const existingUser = await User.findOne({ email });

    // agar already verified user hai
    if (existingUser && existingUser.isVerified) {
      return res
        .status(400)
        .json({ msg: "User already exists. Please login." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(password, 10);

    const masterAdminEmail = process.env.MASTER_ADMIN_EMAIL;
    const isAdmin = email.toLowerCase() === masterAdminEmail?.toLowerCase();
    const isSeller = role === "seller";

    let user;

    // agar user exist karta hai (unverified)
    if (existingUser) {
      existingUser.name = name;
      existingUser.password = hashedPassword;
      existingUser.role = isAdmin ? "admin" : isSeller ? "seller" : "student";
      existingUser.isVerified = false;
      existingUser.otp = otp;
      existingUser.otpExpires = Date.now() + 10 * 60 * 1000;

      user = await existingUser.save();
    } else {
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: isAdmin ? "admin" : isSeller ? "seller" : "student",
        isVerified: false,
        otp,
        otpExpires: Date.now() + 10 * 60 * 1000,
      });
    }

    // mail send
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    let html = isSeller
      ? sellerOtpTemplate(otp, name)
      : registerOtpTemplate(otp, name);

    await transporter.sendMail({
      from: '"BR30 Support" <no-reply@br30.com>',
      to: email,
      subject: "Verify Your Account - OTP",
      html,
    });

    res.status(200).json({
      msg: "OTP sent successfully! Please verify your email.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// --- VERIFY OTP ---
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ msg: "Already verified" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ msg: "OTP expired" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;

    await user.save();

    res.status(200).json({
      msg: "Account verified successfully!",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

// --- LOGIN SYSTEM ---
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. User check karo
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found!" });
    // 🔥 ELITE SECURITY CHECKS 🔥

    // 🔥 ELITE SECURITY CHECKS (English Version) 🔥

    // A. Block Check
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        msg: "Your account has been blocked. Please contact support for assistance. 🚫",
      });
    }

    // B. Verification Check (OTP)
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        msg: "Your email is not verified. Please verify your account using the OTP. ⚠️",
      });
    }

    // C. Rejection Check
    if (user.isRejected) {
      return res.status(403).json({
        success: false,
        msg: "Your registration request has been rejected. ❌",
      });
    }

    // D. Approval Check (Pending Status)
    if (!user.isApproved) {
      return res.status(403).json({
        success: false,
        msg: "Your account is pending approval. Please wait for admin review. ⏳",
      });
    }

    // 🔥 1.5 MASTER ADMIN CHECK (From .env)
    const masterAdminEmail = process.env.MASTER_ADMIN_EMAIL;
    const isAdmin = email.toLowerCase() === masterAdminEmail.toLowerCase();

    // 2. Email Verification check (Admin ko bypass karo)
    if (!isAdmin && !user.isVerified) {
      return res.status(401).json({ msg: "Please verify your email first!" });
    }

    // 3. Password check
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials!" });

    // 🔥 3.5 SELLER APPROVAL CHECK (KYC logic) - Admin ke liye nahi
    if (!isAdmin && user.role === "seller" && !user.isApproved) {
      return res.status(403).json({
        msg: "⏳ Aapka Seller Account abhi Verification mein hai. Admin approval ke baad hi aap login kar payenge (24-48h).",
      });
    }

    // 4. Final Role Decide Karo
    const finalRole = isAdmin ? "admin" : user.role;

    user.lastLogin = new Date();
    await user.save();
    // 5. Token generate karo
    const token = jwt.sign(
      { id: user._id, role: finalRole },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: finalRole, // Yeh frontend ko batayega ki admin-dashboard pe bhejna hai
        badge: user.badge,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Login failed!" });
  }
};

// 🔥 FORGOT PASSWORD CONTROLLER
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ msg: "Email is required!" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ msg: "User with this email does not exist!" });
    }

    // 🔐 Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // ⏱ OTP expiry
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    // 📩 Mail setup
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 🚀 ROLE CHECK
    const isSeller = user.role === "seller";

    // 📧 TEMPLATE SELECT (MAIN LOGIC)
    let html;

    if (isSeller) {
      html = sellerForgotPasswordTemplate(otp, user.name);
    } else {
      html = forgotPasswordTemplate(otp, user.name);
    }

    // 📤 SEND MAIL
    await transporter.sendMail({
      from: '"BR30 Kart" <no-reply@br30kart.com>',
      to: email,
      subject: isSeller ? "Seller Password Reset OTP" : "Password Reset OTP",
      html,
    });

    res.status(200).json({
      msg: "Reset OTP sent to your email!",
    });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ msg: "Error sending reset OTP!" });
  }
};

// --- RESET PASSWORD (Sets New Password) ---
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (user && user.otp === otp && user.otpExpires > Date.now()) {
      user.password = await bcrypt.hash(newPassword, 10);
      user.otp = undefined;
      user.otpExpires = undefined;
      await user.save();
      res
        .status(200)
        .json({ msg: "Password Reset Successful! You can login now." });
    } else {
      res.status(400).json({ msg: "Invalid OTP or Expired!" });
    }
  } catch (err) {
    res.status(500).json({ msg: "Reset failed!" });
  }
};

exports.getProfile = async (req, res) => {
  try {
    // req.user.id humein middleware se mil raha hai
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found!" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
};

// --- UPDATE PROFILE (Photo & Name) ---
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Middleware se mila
    const { name } = req.body;
    let updateData = {};

    if (name) updateData.name = name;

    // Agar Multer ne file upload kar di hai, toh uska URL Cloudinary se aayega
    if (req.file && req.file.path) {
      updateData.profilePic = req.file.path; // Cloudinary URL
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true },
    ).select("-password");

    if (!updatedUser) return res.status(404).json({ msg: "User not found!" });

    res.json({ msg: "Profile Updated! 🚀", user: updatedUser });
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ msg: "Server Error during update!" });
  }
};

// 1️⃣ SEND OTP: Jab user "Send OTP" button click karega
exports.sendOTP = async (req, res) => {
  try {
    const { email, name } = req.body;

    console.log("📩 OTP Request for:", email);

    if (!email) {
      return res.status(400).json({
        msg: "Bhai, email dena zaroori hai!",
      });
    }

    // 🔥 CHECK USER
    let user = await User.findOne({ email });

    if (user) {
      // 1️⃣ Approved user block
      if (user.isApproved === true) {
        return res.status(400).json({
          msg: "Email already registered and Approved! Please Login.",
        });
      }

      // 2️⃣ Rejected user allow re-apply
      if (user.isRejected === true) {
        console.log("🔄 Rejected seller re-applying...");
      }

      // 3️⃣ Already registered (normal case)
      else if (user.password) {
        return res.status(400).json({
          msg: "Email already registered! Please Login.",
        });
      }
    }

    // 🔐 OTP generate
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    // 🆕 New user create
    if (!user) {
      console.log("🆕 Creating new user entry...");

      user = new User({
        email,
        otp,
        otpExpires,
        name: name || "Pending Verification",
        role: "seller",
        isApproved: false,
        isRejected: false,
        isVerified: false,
      });
    } else {
      // 🔄 Update existing user OTP
      console.log("🔄 Updating OTP...");

      user.otp = otp;
      user.otpExpires = otpExpires;
      user.isVerified = false;
    }

    // ⚡ Save (skip validation)
    await user.save({ validateBeforeSave: false });

    console.log("✅ OTP saved for:", email);

    // 📩 Mail setup
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 📧 Email subject logic
    const subject = user.isRejected
      ? "OTP for Re-application"
      : "Your Seller Verification OTP";

    // 📧 Send email
    await transporter.sendMail({
      from: `"BR30Kart Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,

      html: sellerOtpTemplate(otp, user.name || "User"),
    });

    res.status(200).json({
      msg: "OTP sent successfully! 📩",
    });
  } catch (err) {
    console.error("🔥 Send OTP Error:", err);

    res.status(500).json({
      msg: "Server error! OTP send nahi ho paya!",
    });
  }
};

// 2️⃣ VERIFY OTP: Jab user OTP daal kar "Verify" click karega
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log(`🔍 Verifying OTP for: ${email}, OTP: ${otp}`);

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: "User record nahi mila!" });
    }

    // OTP Check Logic
    if (user.otp === otp && Date.now() < user.otpExpires) {
      user.isVerified = true;
      user.otp = null; // Use hone ke baad clear kar do
      user.otpExpires = null;

      // 🔥 YAHAN FIX HAI: validateBeforeSave false rakho taaki password na maange
      await user.save({ validateBeforeSave: false });

      console.log("✅ Email Verified Successfully!");
      return res.status(200).json({ msg: "Email Verified! ✅" });
    } else {
      console.log("❌ Wrong or Expired OTP");
      return res.status(400).json({ msg: "Wrong OTP ya Expired! ❌" });
    }
  } catch (err) {
    console.error("🔥 Verify Error:", err); // Isse terminal mein error dikhega
    res.status(500).json({ msg: "Verification fail ho gayi!" });
  }
};

// 3️⃣ FINAL REGISTER: Jab user "Submit Application" click karega
exports.sellerRegister = async (req, res) => {
  try {
    const { name, email, password, aadharNo, bankName, accountNo, ifscCode } =
      req.body;

    // 1. Check if user exists and OTP was verified
    const user = await User.findOne({ email });
    if (!user || !user.isVerified) {
      return res.status(400).json({ msg: "Pehle OTP verify karein! ⚠️" });
    }

    // 2. Admin Check
    const masterEmail = process.env.MASTER_ADMIN_EMAIL || "";
    const isAdmin = email.toLowerCase() === masterEmail.toLowerCase();

    // 3. File validation check
    if (
      !isAdmin &&
      (!req.files?.aadharFront || !req.files?.aadharBack || !req.files?.bankDoc)
    ) {
      return res.status(400).json({
        msg: "Saare documents (Aadhar Front, Back, Bank Doc) upload karein! 📁",
      });
    }

    // 4. Update Basic Info
    user.name = name;
    user.password = await bcrypt.hash(password, 10);
    user.role = isAdmin ? "admin" : "seller";
    user.isApproved = isAdmin ? true : false;

    // 🔥 SMART RESET: Agar ye rejected seller tha, toh ab isRejected false kar do
    user.isRejected = false;

    // 5. 🚀 SMART OVERWRITE: KYC Details Update
    user.kycDetails = {
      aadharNo: isAdmin ? "" : aadharNo,
      aadharFront:
        req.files?.aadharFront?.[0]?.path || user.kycDetails?.aadharFront || "",
      aadharBack:
        req.files?.aadharBack?.[0]?.path || user.kycDetails?.aadharBack || "",
    };

    // 6. 🚀 SMART OVERWRITE: Bank Details Update
    user.bankDetails = {
      bankName: bankName || "",
      accountNo: accountNo || "",
      ifscCode: ifscCode || "",
      bankDoc: req.files?.bankDoc?.[0]?.path || user.bankDetails?.bankDoc || "",
    };

    // 7. Cleanup OTP fields
    user.otp = null;
    user.otpExpires = null;

    await user.save();
    console.log(
      `✅ Application updated for: ${email}. isRejected reset to false.`,
    );

    res.status(201).json({
      msg: isAdmin
        ? "Master Admin Registered! 🚀"
        : "Application Submitted Successfully! Purana data update kar diya gaya hai. ⏳",
    });
  } catch (err) {
    console.error("🔥 Registration Final Error:", err);
    res.status(500).json({ msg: "Registration failed! Error: " + err.message });
  }
};
