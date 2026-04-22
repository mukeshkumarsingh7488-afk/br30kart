const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },

  productName: String,
  amount: Number,

  // 💰 NEW: कमीशन और कमाई का हिसाब (Add kiya gaya)
  platformCommission: {
    type: Number,
    required: true,
    default: 0,
  },
  sellerEarnings: {
    type: Number,
    required: true,
    default: 0,
  },
  commissionRate: {
    type: Number,
    default: 20, // Aapka standard 20% commission
  },

  // 👨‍🏫 Seller Tracking
  sellerId: {
    type: String,
    required: false,
  },
  sellerEmail: String,
  sellerName: String,

  // 👤 Buyer Tracking
  customerName: String,
  customerEmail: String,

  // 💳 Payment Details
  paymentId: String,
  orderId: String,

  // 🔄 Status Tracking
  status: {
    type: String,
    default: "pending",
  },

  payoutStatus: {
    type: String,
    enum: ["Pending", "Completed"],
    default: "Pending",
  },

  payoutDate: {
    type: Date,
  },

  mailTrack: {
    type: String,
    default: "Awaiting Payment",
  },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", OrderSchema);
