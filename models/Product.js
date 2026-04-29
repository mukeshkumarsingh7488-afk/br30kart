//#region ━━━━━ 🚀 WELCOME DEVELOPER | SYSTEM INITIALIZED ━━━━━
// 🛒 PRODUCT MODEL: Stores course details, pricing, and media assets.
const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: {
      type: String,
      enum: [
        "Premium-Trading-Courses",
        "Trading-Standard-Course",
        "Crash-Course",
        "Other",
        "Bestseller",
        "pdfs",
      ],
      required: true,
    },
    price: { type: Number, required: true },
    videoLink: { type: String },
    thumbnail: { type: String, required: true },
    sellerEmail: { type: String, required: true },
    sellerName: { type: String, required: true },

    // 🔥 DISCOUNT LOGIC
    discount: { type: Number, default: 0 },

    // ✅ NEW: Yeh batayega ki discount "Global" hai ya "Individual"
    discountSource: {
      type: String,
      enum: ["global", "individual", null],
      default: null,
    },

    // 🔥 MULTI-SELLER CONTROLS
    isApproved: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isVisible: { type: Boolean, default: true },
    couponCreatedAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

// 🕒 VIRTUAL: 7 Din ki Auto-Expiry Check (Backend/Frontend ke liye)
ProductSchema.virtual("isDiscountValid").get(function () {
  if (!this.discount || this.discount <= 0) return false;

  const startTime = this.couponCreatedAt || this.createdAt;
  const sevenDays = 7 * 24 * 60 * 60 * 1000; // ✅ 7 Din Set kiya hai
  const expiryTime = new Date(startTime).getTime() + sevenDays;

  return Date.now() < expiryTime;
});

// Virtuals ko JSON me dikhane ke liye
ProductSchema.set("toJSON", { virtuals: true });
ProductSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Product", ProductSchema);

//#endregion
// ==========================================
// ✅ Schema organized, validated, and refactored.
// 🚀 Database Model is ready for production!
// ==========================================
