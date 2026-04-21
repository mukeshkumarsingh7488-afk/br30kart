const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fcmToken: { type: String, default: "" },

    // 🔥 Sirf Role se control hoga sab
    role: {
      type: String,
      enum: ["student", "seller", "vip", "admin"],
      default: "student",
    },

    profilePic: {
      type: String,
      default: "",
    },

    lastLogin: {
      type: Date,
      default: Date.now,
    },

    // 🔥 User Block/Unblock status
    isBlocked: {
      type: Boolean,
      default: false,
    },

    monthlyProfit: {
      type: Number,
      default: 0,
    },

    // 🎓 --- AUTOMATIC CERTIFICATE & PROGRESS SYSTEM ---
    completedLessons: [
      {
        type: String,
      },
    ],
    isCertified: {
      type: Boolean,
      default: false,
    },

    certificateData: {
      fullName: { type: String, default: "" },
      mobile: { type: String, default: "" },
      photoUrl: { type: String, default: "" },
      issueDate: { type: Date },

      certId: { type: String, default: "" },
      downloadUrl: { type: String, default: "" },
    },

    purchasedCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    hiddenCourses: [
      {
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product", // Aapke Course/Product model ka naam
        },
        isHidden: {
          type: Boolean,
          default: true,
        },
        hiddenAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    isRejected: {
      type: Boolean,
      default: false,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    // --- SELLER KYC & APPROVAL SYSTEM ---
    isApproved: {
      type: Boolean,
      default: false,
    },

    kycDetails: {
      aadharNo: { type: String, default: "" },
      aadharFront: { type: String, default: "" },
      aadharBack: { type: String, default: "" },
    },

    // 🏦 --- SELLER BANK DETAILS ---
    bankDetails: {
      bankName: { type: String, default: "" },
      accountNo: { type: String, default: "" },
      ifscCode: { type: String, default: "" },
      bankDoc: { type: String, default: "" },
    },

    otp: {
      type: String,
    },
    otpExpires: {
      type: Date,
    },
  },
  { timestamps: true },
);
// 🔥 SMART AUTO-FIX: Save hone se pehle data check karega
userSchema.pre("save", async function () {
  try {
    if (this.isApproved) {
      this.isRejected = false;
    }

    if (this.isRejected) {
      this.isApproved = false;
    }
  } catch (err) {
    console.error("Pre-save hook error:", err);
  }
});
module.exports = mongoose.model("User", userSchema);
