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
      // 1. Start Date ko din ki shuruat banao (00:00:00 UTC)
      const startDate = new Date(start);
      startDate.setUTCHours(0, 0, 0, 0);

      // 2. End Date ko din ka anth banao (23:59:59 UTC)
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
    let pendingPayout = 0;

    orders.forEach((order) => {
      totalRevenue += order.amount || 0;
      // Atlas image ke hisaab se 'pending' payout status check
      if (
        order.payoutStatus &&
        order.payoutStatus.toLowerCase() === "pending"
      ) {
        pendingPayout += order.amount * 0.8;
      }
    });

    const adminFee = totalRevenue * 0.2;
    const sellerEarnings = totalRevenue - adminFee;

    res.json({
      success: true,
      summary: {
        totalRevenue: Math.round(totalRevenue),
        sellerProfit: Math.round(sellerEarnings),
        pendingAmount: Math.round(pendingPayout),
        adminFee: Math.round(adminFee),
      },
      sales: orders,
    });

    console.log(
      `📊 Date Range: ${start} to ${end} | Orders Found: ${orders.length}`,
    );
  } catch (err) {
    console.error("🔥 Analytics Error:", err);
    res.status(500).json({ success: false, msg: "Calculation Error!" });
  }
};

// track sales record
exports.getSellerSalesRecords = async (req, res) => {
  try {
    const { sellerEmail, search, from, to } = req.query;
    let query = { sellerEmail: sellerEmail };

    if (search) {
      query.productName = { $regex: search, $options: "i" };
    }

    if (from && to) {
      query.createdAt = {
        $gte: new Date(from),
        $lte: new Date(to),
      };
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });

    // 1. Total Gross Revenue (कुल सेल)
    const totalRevenue = orders.reduce(
      (sum, order) => sum + (order.amount || 0),
      0,
    );

    // 2. Pending Payout Logic (सेलर को कितना पैसा देना बाकी है)
    // इमेज के अनुसार 'payoutStatus' अगर "pending" है, तो उसका 80% निकालो
    const pendingAmount = orders.reduce((sum, order) => {
      if (order.payoutStatus === "pending") {
        return sum + order.amount * 0.8;
      }
      return sum;
    }, 0);

    res.status(200).json({
      success: true,
      data: {
        orders,
        totals: {
          revenue: totalRevenue,
          earnings: totalRevenue * 0.8,
          commission: totalRevenue * 0.2,
          pending: pendingAmount, // यह फ्रंटएंड के 4th बॉक्स के लिए है
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

    // 1. ऑर्डर्स को ग्रुप करें, गिनती (Count) और कुल कमाई (Revenue) निकालें
    const salesStats = await Order.aggregate([
      { $match: { sellerEmail: email } },
      {
        $group: {
          _id: "$productName",
          count: { $sum: 1 }, // कितनी बार बिका
          revenue: { $sum: "$amount" }, // टोटल कितनी कमाई हुई (ये फ्रंटएंड के लिए ज़रूरी है)
        },
      },
      { $sort: { count: -1 } }, // सबसे ज़्यादा बिकने वाला ऊपर
    ]);

    // 2. टेबल के लिए सभी ऑर्डर्स
    const allOrders = await Order.find({ sellerEmail: email }).sort({
      createdAt: -1,
    });

    // 3. सबसे कम बिकने वाला कोर्स (Worst Seller) निकालें
    const worstSeller =
      salesStats.length > 0 ? salesStats[salesStats.length - 1] : null;

    res.status(200).json({
      success: true,
      topSellers: salesStats,
      worstSeller: worstSeller, // बॉक्स 4 के लिए
      allData: allOrders,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
