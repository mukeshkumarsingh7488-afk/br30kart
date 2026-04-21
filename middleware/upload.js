const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
// Hum yahan direct v2 use karenge taaki 'upload_stream' mil jaye
const cloudinary = require("cloudinary").v2; 

/* --------------------------------------------------------------------------
   1. CLOUDINARY CONFIG (Direct for Safety)
-------------------------------------------------------------------------- */
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

/* --------------------------------------------------------------------------
   2. STORAGE CONFIGURATION
-------------------------------------------------------------------------- */
const storage = new CloudinaryStorage({
  cloudinary: cloudinary, // Ab isse saare functions mil jayenge
  params: async (req, file) => {
    return {
      folder: "profile_pics",
      format: "jpg", // ya jpeg/png
      public_id: req.user.id, // User ID se purani photo replace hogi
      resource_type: "image",
    };
  },
});

/* --------------------------------------------------------------------------
   3. INITIALIZE MULTER
-------------------------------------------------------------------------- */
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit kaafi hai profile ke liye
});

module.exports = upload;


