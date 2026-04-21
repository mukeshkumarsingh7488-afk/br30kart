const express = require("express");
const router = express.Router();
const Seller = require("../models/Seller");
const Coupon = require("../models/coupon");
const Order = require("../models/order");
const upload = require("../middleware/multerCloudinary");
const PaytmChecksum = require("paytmchecksum");
const https = require("https");
const auth = require("../middleware/auth");
const Product = require("../models/Product");
const Notification = require("../models/Notification");
const productController = require("../controllers/productController");
// @route   POST /api/products/upload
// ✅ Upload route mein 'upload.single' add kiya
router.post("/upload", async (req, res) => {
  try {
    console.log("📦 Incoming JSON Data:", req.body);

    const {
      title,
      category,
      price,
      videoLink,
      thumbnail,
      sellerEmail,
      sellerName,
    } = req.body;

    // 1. Security check
    if (!sellerEmail || sellerEmail === "null") {
      return res
        .status(400)
        .json({ success: false, msg: "Seller Email missing!" });
    }

    // 2. Product Save (Aapka Purana Logic)
    const newProduct = new Product({
      title,
      category,
      price: Number(price),
      videoLink,
      thumbnail,
      sellerEmail,
      sellerName: sellerName || "Official Seller",
    });

    await newProduct.save();
    console.log("✅ Product Live on Atlas!");

    // 3. 🔔 NOTIFICATION SAVE (Ab yahan se save hoga)
    try {
      const Notification = require("../models/Notification"); // Model import yahan zaruri hai
      const notifData = new Notification({
        title: "Naya Course Aa Gaya! 🔥",
        message: `${title} ab live hai, abhi check karein.`,
        productId: newProduct._id,
        category: category,
      });
      await notifData.save();
      console.log("✅ Notification Saved to DB!");
    } catch (notifErr) {
      console.error("❌ Notification DB Error:", notifErr.message);
    }

    // 4. 📡 REAL-TIME SOCKET EMIT
    const io = req.app.get("socketio");
    if (io) {
      io.emit("new_notification", {
        type: "NEW_PRODUCT",
        title: "Naya Course Aa Gaya! 🔥",
        message: `${title} ab live है, अभी चेक करें।`,
        productId: newProduct._id,
        category: category,
      });
      console.log("📡 Socket Event Sent!");
    }

    res.status(201).json({
      success: true,
      msg: "Content Live on Atlas & Notification Sent!",
    });
  } catch (err) {
    console.error("🔥 DB Save Error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /api/products
// @desc    Saare products fetch karna
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Data fetch nahi ho raha!" });
  }
});

// 1. Seller ke apne products fetch karna (Dashboard ke liye)
router.get("/my-products/:email", async (req, res) => {
  try {
    const products = await Product.find({ sellerEmail: req.params.email });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Fetch error" });
  }
});

// 2. Individual Course ka Discount/Coupon set karna
router.put("/update-discount/:id", async (req, res) => {
  try {
    const { discount } = req.body;
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      {
        discount: discount,
        couponCreatedAt: new Date(), // Yahan se 7 din ka timer shuru hoga
      },
      { new: true },
    );
    res.json({ message: "Discount Updated!", data: updated });
  } catch (err) {
    res.status(500).json({ error: "Update error" });
  }
});

// Coupon delete karne ke liye
router.delete("/cancel-coupon", async (req, res) => {
  try {
    await Coupon.deleteMany({});
    res.json({ message: "Coupon Deleted!" });
  } catch (err) {
    res.status(500).json({ error: "Delete error" });
  }
});

// 1. Seller Register karne ke liye (With Duplicate Check)
router.post("/register-seller", async (req, res) => {
  try {
    const { email } = req.body;

    // Manual check: Kya ye email Atlas mein hai?
    const existingSeller = await Seller.findOne({ email });
    if (existingSeller) {
      return res.status(400).json({
        error: "This email is already registered. Please try another one.",
      });
    }

    const newSeller = new Seller(req.body);
    await newSeller.save();
    res.status(201).json({
      message: "Congratulations! Your seller profile has been created.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong on the server!" });
  }
});

// प्रोफाइल फेच करने का रास्ता (Route)
router.post("/get-seller", async (req, res) => {
  try {
    const { email } = req.body; // फ्रंटएंड से ईमेल आएगा

    // 'Seller' आपके मॉडल का नाम है, और 'email' DB की फील्ड है
    const seller = await Seller.findOne({ email: email });

    if (seller) {
      // अगर ईमेल मिल गया तो पूरा डेटा (नाम, बायो, सोशल लिंक) भेज दो
      return res.status(200).json({ success: true, data: seller });
    } else {
      return res.status(404).json({
        success: false,
        message: "Bhai, ye email registered nahi hai!",
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error!" });
  }
});

// 2. Email se seller ki detail nikalne ke liye
router.get("/seller-info/:email", async (req, res) => {
  try {
    const seller = await Seller.findOne({ email: req.params.email });
    if (!seller) {
      return res.status(404).json({ message: "Seller nahi mila!" });
    }
    res.json(seller);
  } catch (err) {
    res.status(500).json({ error: "Data fetch karne mein error." });
  }
});

// 1. Course Delete Route
router.delete("/delete/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: "Delete Error" });
  }
});

// 2. Course Update/Edit Route
router.put("/update/:id", upload.single("thumbnail"), async (req, res) => {
  try {
    console.log("📦 Incoming Body:", req.body); // Check karne ke liye
    console.log("📷 Incoming File:", req.file);

    const { title, price, videoLink } = req.body;
    let updateFields = { title, price, videoLink };

    // Agar nayi image upload hui hai toh uska path lo
    if (req.file) {
      updateFields.thumbnail = req.file.path;
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true },
    );

    if (!updated) return res.status(404).json({ msg: "Product nahi mila" });

    console.log("✅ DB Update Success!");
    res.json(updated);
  } catch (err) {
    console.error("❌ Update Error:", err.message);
    res.status(500).json({ error: "Update Error", details: err.message });
  }
});
// Sabhi products par ek saath discount set karne ke liye
router.post("/set-global-discount", async (req, res) => {
  try {
    const { discount, sellerEmail } = req.body;

    // Sirf us seller ke saare products update karo
    await Product.updateMany(
      { sellerEmail: sellerEmail },
      {
        discount: discount,
        couponCreatedAt: new Date(), // Timer sabpe ek saath shuru hoga
      },
    );

    res.json({ message: "Global Discount Applied to all courses!" });
  } catch (err) {
    res.status(500).json({ error: "Global update failed!" });
  }
});

// 1. Sale record karne ke liye (Jab customer 'Buy Now' kare)
router.post("/place-order", async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();
    res.status(201).json({ message: "Sale successful!" });
  } catch (err) {
    res.status(500).json({ error: "Order failed" });
  }
});

// 2. Seller ki total sales report ke liye
router.get("/seller-report/:email", async (req, res) => {
  try {
    const orders = await Order.find({ sellerEmail: req.params.email }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Report failed" });
  }
});

// 🔔 notifications pehle
router.get("/notifications", async (req, res) => {
  try {
    const Notification = require("../models/Notification");
    const data = await Notification.find().sort({ createdAt: -1 }).limit(10);
    res.json(data); // Ab frontend ko data mil jayega
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔥 BUY
router.post("/purchase/:id", auth, productController.purchaseProduct);

// 🔥 MY COURSES
router.get("/my-courses", auth, productController.getMyProducts);

// 🔥 GET SINGLE PRODUCT (WATCH PAGE)
router.get("/:id", auth, productController.getProductById);

// hide and delet product in active-seller page dropdown
router.delete("/:id", auth, productController.deleteProduct);
router.put("/toggle-visibility/:id", auth, productController.toggleVisibility);
// bell notification routes
module.exports = router;
