const mongoose = require("mongoose");

const SellerSchema = new mongoose.Schema({
  name: { type: String, required: true },

  sellerId: {
    type: String,
    unique: true,
    required: false,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  address: { type: String, required: true },
  bio: { type: String },

  youtube: { type: String },
  instagram: { type: String },
  facebook: { type: String },
  telegram: { type: String },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Seller", SellerSchema);
