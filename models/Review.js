//#region  review brr30kart

const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  username: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },

  // Isse 'User' model ke saath link kar rahe hain photo nikalne ke liye
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },

  // Admin Features ke liye naye fields
  status: {
    type: String,
    enum: ["approved", "hidden", "pending"],
    default: "approved",
  },
  adminReply: {
    type: String,
    default: "",
  },

  // Auto reply ke liye
  replied: {
    type: Boolean,
    default: false,
  },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Review", reviewSchema);
//#endregion
