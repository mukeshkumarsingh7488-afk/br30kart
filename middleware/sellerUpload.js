const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Email use karenge ya random timestamp taaki crash na ho
    const identifier = req.body.email ? req.body.email.split('@')[0] : Date.now();
    return {
      folder: "seller_docs",
      format: "jpg",
      public_id: `${identifier}-${file.fieldname}-${Date.now()}`,
    };
  },
});

const sellerUpload = multer({ storage: storage });
module.exports = sellerUpload;

