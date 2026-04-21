//#region Coupon Model
// Ye model humare coupons ke liye hai. Isme hum coupon code, discount percentage, active status, aur expiry date store karenge.
// Jab bhi koi coupon create hoga, toh iska record yahan save ho jayega, taki hum future me usko access kar sakein.
const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  }, // Jaise: OFFER50

  discount: {
    type: Number,
    required: true,
  }, // Jaise: 50

  isActive: {
    type: Boolean,
    default: true,
  }, // Admin manually cancel kar sakega

  // 🔥 Expiry Date: Har coupon ke liye 7 din ka fixed time
  expiryDate: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Note: Humne 'expires' hataya hai kyunki hume data manually control karna hai
module.exports = mongoose.model("Coupon", couponSchema);
//#endregion
