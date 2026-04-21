const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  // 🆔 Ye 'productId' hi aapki 'Course ID' hai.
  // Isse hum track karenge ki user ne konsa course kharida hai.
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },

  productName: String, // Course ka naam
  amount: Number, // Kitna paisa diya

  // 👨‍🏫 Seller Tracking
  sellerId: {
    type: String,
    required: true,
  },
  sellerEmail: String,
  sellerName: String,

  // 👤 Buyer Tracking (Access isi se check hoga)
  customerName: String,
  customerEmail: String, // Sabse important field access ke liye

  // 💳 Payment Details
  paymentId: String,
  orderId: String,

  // 🔄 Status Tracking
  status: {
    type: String,
    default: "pending", // Payment hote hi isse "success" ya "completed" karna hai
  },

  // 💰 Payout Tracking (Seller ko paise bhejne ke liye)
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

// Final Export (Ek hi baar export karna kaafi hai)
module.exports = mongoose.model("Order", OrderSchema);
