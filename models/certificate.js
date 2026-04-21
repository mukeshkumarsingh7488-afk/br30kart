// Ye model humare certificates ke liye hai. Isme hum certificate ka naam, ID, course, date, aur file name store karenge.
// Jab bhi koi certificate generate hoga, toh iska record yahan save ho jayega, taki hum future me usko access kar sakein.
//#region Upgraded Certificate Model (Atlas + Cloudinary Ready)
const mongoose = require("mongoose");

const certSchema = new mongoose.Schema(
  {
    // 1. User Linking: Pata rahe ki ye kiski mehnat hai
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // 2. Student Details
    name: { type: String, required: true },
    mobile: { type: String },

    // 3. Certificate Identity (Verification ke liye main cheez)
    certId: {
      type: String,
      unique: true, // Ek ID do baar nahi ban sakti
      required: true,
    },
    course: { type: String, required: true },

    // 4. Digital Assets (Local file ki jagah Cloudinary Link)
    downloadUrl: {
      type: String,
      required: true, // Cloudinary ka secure_url yahan save hoga
    },
    fileName: String, // Jaise: BR30-XXXXXX.pdf (Record ke liye)

    // 5. Timeline
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
); // Automatically createdat aur updatedat add kar dega

module.exports = mongoose.model("Certificate", certSchema);
//#endregion
