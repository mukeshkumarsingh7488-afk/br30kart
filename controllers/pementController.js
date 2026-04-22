//#region IMPORTS
const Razorpay = require("razorpay");
const crypto = require("crypto");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/order");
const Coupon = require("../models/coupon");
const {
  getSupportFailureTemplate,
  getUserFailureTemplate,
} = require("../utils/emailTemplate");

//#endregion

//#region Rozorpay key_id And Key_Secret Process.env file
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
//#endregion

//#region Create Payment Order (Frontend se order create karne ke liye)
exports.createOrder = async (req, res) => {
  try {
    const { productId, couponCode, buyerEmail } = req.body;

    // 1. Product dhoondo aur check karo
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, msg: "Product nahi mila" });
    }

    let finalPrice = Number(product.price);
    let isApplied = false;
    let appliedCouponData = null;

    // 2. Pro Level Coupon Logic
    if (couponCode) {
      const cleanCode = couponCode.trim().toUpperCase();
      const validCoupon = await Coupon.findOne({
        code: cleanCode,
        isActive: true, // Sirf active coupon uthao
      });

      if (validCoupon) {
        // Expiry Date Check
        const now = new Date();
        if (validCoupon.expiryDate && now > validCoupon.expiryDate) {
          return res
            .status(400)
            .json({ success: false, msg: "Coupon expire ho chuka hai" });
        }

        // Discount Calculate karo
        const discountAmount =
          (finalPrice * Number(validCoupon.discount)) / 100;
        finalPrice -= discountAmount;
        isApplied = true;
        appliedCouponData = cleanCode;
      } else {
        // Agar coupon invalid hai toh error de sakte ho ya ignore kar sakte ho
        console.log("Invalid Coupon Attempted:", cleanCode);
      }
    }

    // 3. Razorpay Options (Security: Math.round zaruri hai decimals ke liye)
    const options = {
      amount: Math.round(finalPrice * 100), // Amount in Paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}_${productId.substring(0, 5)}`,
      notes: {
        productId: productId,
        buyerEmail: buyerEmail,
        appliedCoupon: appliedCouponData || "NONE",
      },
    };

    // 4. Razorpay Order Create
    const order = await razorpay.orders.create(options);

    // 5. Response bhejo
    res.status(200).json({
      success: true,
      orderId: order.id,
      key: process.env.RAZORPAY_KEY_ID, // Frontend ke liye key yahi se bhej do
      amount: order.amount,
      currency: order.currency,
      finalPrice: finalPrice,
      discountApplied: isApplied,
      productTitle: product.title,
    });
  } catch (err) {
    console.error("Pro Order Error:", err);
    res.status(500).json({
      success: false,
      msg: "Server Error: Order generate nahi ho paya",
    });
  }
};

//#endregion

// #region Payment Verify (Frontend se payment verify karne ke liye)
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courseId,
      amount,
    } = req.body;

    // 1. Basic Validation
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, msg: "Payment details missing!" });
    }

    // 2. Razorpay Signature Verification
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({
        success: false,
        msg: "Transaction Tampered! Invalid Signature.",
      });
    }

    // 3. Double Check (Duplicate Payment)
    const existingOrder = await Order.findOne({
      paymentId: razorpay_payment_id,
    });
    if (existingOrder) {
      return res
        .status(400)
        .json({ success: false, msg: "Payment already processed!" });
    }

    // 4. Fetch User and Course
    const [user, course] = await Promise.all([
      User.findById(req.user.id),
      Course.findById(courseId),
    ]);

    if (!user || !course) {
      return res
        .status(404)
        .json({ success: false, msg: "User or Course not found" });
    }

    // 🔥 5. AUTO CALCULATION LOGIC (Commission & Earnings)
    const orderAmount = Number(amount);
    const commRate = 20; // 20% कमीशन रेट
    const platformCommission = (orderAmount * commRate) / 100;
    const sellerEarnings = orderAmount - platformCommission;

    // 6. User Status Update
    if (!user.purchasedCourses.includes(courseId)) {
      user.purchasedCourses.push(courseId);
    }
    user.isVip = true;
    user.badge = "vip";

    // 7. Final Order Data Save with Commission Fields
    const newOrder = new Order({
      productId: course._id,
      productName: course.title,
      amount: orderAmount,

      // ✅ DB में हिसाब सेव हो रहा है
      platformCommission: platformCommission,
      sellerEarnings: sellerEarnings,
      commissionRate: commRate,

      sellerId: course.sellerId,
      sellerEmail: course.sellerEmail,
      sellerName: course.sellerName,
      customerEmail: user.email,
      customerName: user.name,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      status: "success",
      payoutStatus: "Pending",
      mailTrack: "Course Unlocked",
    });

    await Promise.all([user.save(), newOrder.save()]);

    return res.status(200).json({
      success: true,
      msg: "Payment Verified & Course Unlocked! 🚀",
      orderId: newOrder._id,
    });
  } catch (err) {
    console.error("❌ Pro Verify Error:", err);
    return res.status(500).json({
      success: false,
      msg: "Server Error during verification",
      error: err.message,
    });
  }
};

//#endregion

// #region Payment Failure Alert Logic (Support Team & User ko alert bhejne ke liye)
// 🔥 NAYA SYSTEM: Payment Failure Alert Logic
exports.handlePaymentFailure = async (req, res) => {
  try {
    const { courseId, reason } = req.body;

    // =========================
    // 1. FETCH DATA
    // =========================
    const user = await User.findById(req.user.id);
    const course = await Course.findById(courseId);

    if (!user || !course) {
      return res.status(404).json({ msg: "User ya Course nahi mila" });
    }

    console.log("User:", user.name, user.email);
    console.log("Course:", course.title);

    // =========================
    // 2. SUPPORT TEAM EMAIL
    // =========================
    await sendEmail({
      authEmail: process.env.SUPPORT_EMAIL_USER,
      authPass: process.env.SUPPORT_EMAIL_PASS,
      brandName: "SYSTEM ALERT",
      email: process.env.SUPPORT_EMAIL_USER,
      subject: `⚠️ Payment Failed: ${user.name}`,
      html: getSupportFailureTemplate(user, course, reason),
    });

    // =========================
    // 3. USER EMAIL
    // =========================
    await sendEmail({
      authEmail: process.env.SUPPORT_EMAIL_USER,
      authPass: process.env.SUPPORT_EMAIL_PASS,
      brandName: "BR30 TRADER Support",
      email: user.email,
      subject: `Need help with ${course.title}?`,
      html: getUserFailureTemplate(user, course, reason),
    });

    return res.json({
      success: true,
      msg: "Failure alerts sent!",
    });
  } catch (err) {
    console.error("❌ FAILURE ALERT ERROR:", err);
    return res.status(500).json({
      success: false,
      msg: "Alert Error",
      error: err.message,
    });
  }
};
//#endregion
