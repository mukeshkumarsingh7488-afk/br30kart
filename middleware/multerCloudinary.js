const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// ✅ ONLY THIS (no duplicate)
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "course_thumbnails",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const uploadCloud = multer({ storage });

module.exports = uploadCloud;