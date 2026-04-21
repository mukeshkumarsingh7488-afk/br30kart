const express = require("express");
const router = express.Router();

const Razorpay = require("razorpay");
const crypto = require("crypto");

const Order = require("../models/order");
const Product = require("../models/Product");
const pementController = require("../controllers/pementController");

// 🔥 Razorpay init
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// =============================
// ✅ CREATE ORDER
// =============================
router.post("/create-order", async (req, res) => {
  try {
    const { amount, productId, buyerEmail, sellerEmail } = req.body;

    // Razorpay amount humesha paise mein leta hai (Amount * 100)
    const options = {
      amount: Number(amount) * 100, 
      currency: "INR",
      receipt: "rcpt_" + Date.now()
    };

    const order = await razorpay.orders.create(options);

    // Frontend ko data wapas bhejna
    res.json({
      orderId: order.id,
      amount: order.amount,
      productId,
      buyerEmail,
      sellerEmail,
      key: process.env.RAZORPAY_KEY_ID
    });

  } catch (err) {
    console.error("Order Creation Error:", err);
    res.status(500).json({ error: "Order create failed" });
  }
});


// =============================
// ✅ VERIFY PAYMENT
// =============================
router.post("/verify-payment", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      productId,
      buyerEmail,
      sellerEmail
    } = req.body;

    // 1. Signature Verify karna
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      
      // 2. Product ki details nikaalna (Name aur Price ke liye)
      const productData = await Product.findById(productId);
      
      // 3. Seller ka naam fetch karna (Database se email ke zariye)
      const sellerData = await User.findOne({ email: sellerEmail });

      // 4. Order save karna (Saari fields ke saath)
      await Order.create({
        productId: productId,
        productName: productData ? productData.productName : "Unknown Course", // Product model ke field ka naam 'productName' hai ya 'name' ye check kar lena
        amount: productData ? productData.amount : 0, // Dashboard tracking ke liye
        sellerEmail: sellerEmail,
        sellerName: sellerData ? sellerData.name : "Unknown Seller", // 🔥 Ab Name save hoga!
        customerEmail: buyerEmail,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        status: "success",
        payoutStatus: "Pending" // Friday Payout tracking ke liye default status
      });

      res.json({ success: true, message: "Payment Verified & Order Saved" });

    } else {
      res.status(400).json({ success: false, message: "Invalid Signature" });
    }

  } catch (err) {
    console.error("Verification Error:", err);
    res.status(500).json({ error: "Verification failed" });
  }
});



// =============================
// ✅ MY COURSES
// =============================
router.get("/my-courses/:email", async (req, res) => {
  try {
    const orders = await Order.find({
      buyerEmail: req.params.email,
      status: "success"
    });

    const productIds = orders.map(o => o.productId);

    const products = await Product.find({
      _id: { $in: productIds }
    });

    res.json(products);

  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
});

module.exports = router;