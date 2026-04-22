// controllers/sellerController.js
const Order = require("../models/order"); // Apne Order model ka path sahi kar lena
exports.getSellerAnalytics = async (req, res) => {
  try {
    const { email, start, end } = req.query;

    let query = {
      sellerEmail: email,
      status: "success",
    };

    if (start && end) {
      const startDate = new Date(start);
      startDate.setUTCHours(0, 0, 0, 0);

      const endDate = new Date(end);
      endDate.setUTCHours(23, 59, 59, 999);

      query.createdAt = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });

    // Summary Calculations
    let totalRevenue = 0;
    let sellerProfit = 0;
    let pendingAmount = 0;
    let adminFee = 0;

    orders.forEach((order) => {
      totalRevenue += Number(order.amount || 0);

      // ✅ DB से सीधा असली वैल्यू उठाओ (No 0.2/0.8 logic)
      adminFee += Number(order.platformCommission || 0);
      sellerProfit += Number(order.sellerEarnings || 0);

      // ✅ Pending Payout का सटीक हिसाब (DB value)
      if (
        order.payoutStatus &&
        order.payoutStatus.toLowerCase() === "pending"
      ) {
        pendingAmount += Number(order.sellerEarnings || 0);
      }
    });

    res.json({
      success: true,
      summary: {
        totalRevenue: Math.round(totalRevenue),
        sellerProfit: Math.round(sellerProfit), // असली कमाई
        pendingAmount: Math.round(pendingAmount), // जो अभी मिलना बाकी है
        adminFee: Math.round(adminFee), // आपका कमीशन
      },
      sales: orders,
    });

    console.log(
      `📊 Analytics: ${email} | Orders: ${orders.length} | Range: ${start} - ${end}`,
    );
  } catch (err) {
    console.error("🔥 Analytics Error:", err);
    res.status(500).json({ success: false, msg: "Calculation Error!" });
  }
};

// track sales record (Updated with DB Records)
exports.getSellerSalesRecords = async (req, res) => {
  try {
    const { sellerEmail, search, from, to } = req.query;
    let query = { sellerEmail: sellerEmail };

    if (search) {
      query.productName = { $regex: search, $options: "i" };
    }

    if (from && to) {
      query.createdAt = {
        $gte: new Date(new Date(from).setUTCHours(0, 0, 0, 0)),
        $lte: new Date(new Date(to).setUTCHours(23, 59, 59, 999)),
      };
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });

    // 1. Total Gross Revenue (कुल सेल)
    const totalRevenue = orders.reduce(
      (sum, order) => sum + (Number(order.amount) || 0),
      0,
    );

    // 2. 🔥 असली Earnings & Commission (सीधा DB से)
    const totalEarnings = orders.reduce(
      (sum, order) => sum + (Number(order.sellerEarnings) || 0),
      0,
    );
    const totalCommission = orders.reduce(
      (sum, order) => sum + (Number(order.platformCommission) || 0),
      0,
    );

    // 3. Pending Payout (जो अभी तक 'Pending' है)
    const pendingAmount = orders.reduce((sum, order) => {
      // 'Pending' या 'pending' दोनों चेक करें
      if (
        order.payoutStatus &&
        order.payoutStatus.toLowerCase() === "pending"
      ) {
        return sum + (Number(order.sellerEarnings) || 0);
      }
      return sum;
    }, 0);

    res.status(200).json({
      success: true,
      data: {
        orders,
        totals: {
          revenue: Math.round(totalRevenue),
          earnings: Math.round(totalEarnings), // 👈 80% logic removed
          commission: Math.round(totalCommission), // 👈 20% logic removed
          pending: Math.round(pendingAmount), // 4th box (Actual Pending)
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBestSellers = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email)
      return res
        .status(400)
        .json({ success: false, message: "Email required" });

    // 1. ऑर्डर्स को ग्रुप करें, Count, Revenue और Earnings निकालें
    const salesStats = await Order.aggregate([
      { $match: { sellerEmail: email, status: "success" } }, // सिर्फ सफल ऑर्डर्स
      {
        $group: {
          _id: "$productName",
          count: { $sum: 1 },
          totalRevenue: { $sum: { $toDouble: "$amount" } },
          // 🔥 असली मुनाफा (80%) जो सेलर के पास गया
          totalEarnings: { $sum: { $toDouble: "$sellerEarnings" } },
        },
      },
      { $sort: { count: -1 } }, // सबसे ज़्यादा बिकने वाला ऊपर
    ]);

    // 2. सबसे कम बिकने वाला कोर्स (Worst Seller)
    const worstSeller =
      salesStats.length > 0 ? salesStats[salesStats.length - 1] : null;

    res.status(200).json({
      success: true,
      topSellers: salesStats, // इसमें अब 'totalEarnings' भी है
      worstSeller: worstSeller,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
