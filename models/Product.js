const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    // Fix categories as per your frontend logic
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
    discount: { type: Number, default: 0 },

    // 🔥 NEW: Multi-Seller Controls
    isApproved: { type: Boolean, default: true }, // Admin approval flag
    isFeatured: { type: Boolean, default: false }, // Special badge ke liye
    isVisible: { type: Boolean, default: true },
    couponCreatedAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
); // Timestamps se 'createdAt' aur 'updatedAt' auto ban jayega

module.exports = mongoose.model("Product", ProductSchema);
