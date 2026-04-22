//#region
const User = require("../models/User");
const Order = require("../models/order");
const nodemailer = require("nodemailer");
const Product = require("../models/Product");
require("dotenv").config();
const {
  sendEmail,
  payoutTemplate,
  rejectSellerTemplate,
  approvalTemplate,
  rejectDocsTemplate,
  sellerAlertTemplate,
  sellerAlertTemplate2,
} = require("../utils/emailTemplate");

// 1. Dashboard Data
exports.getAllSellersDocs = async (req, res) => {
  try {
    const allUsers = await User.find({});

    // Students की लिस्ट में 'student' और 'vip' दोनों को रखो
    const students = allUsers.filter(
      (u) => u.role === "student" || u.role === "vip",
    );
    const activeSellers = allUsers.filter(
      (u) => u.role === "seller" && u.isApproved === true,
    );
    const pendingSellers = allUsers.filter(
      (u) => u.role === "seller" && u.isApproved === false,
    );

    // सिर्फ VIPs की अलग लिस्ट (नए बटन के लिए)
    const vips = allUsers.filter((u) => u.role === "vip");

    res.status(200).json({
      success: true,
      students: students,
      sellers: activeSellers,
      requests: pendingSellers,
      vips: vips, // ये नया डेटा भेजा
      totalStudents: students.length,
      totalSellers: activeSellers.length,
      totalVips: vips.length,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Seller Request Approved करने का लॉजिक
exports.approveSeller = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. पहले चेक करो कि क्या ये यूजर सच में सेलर है?
    const user = await User.findById(id);

    if (!user) {
      console.log("❌ Approval Error: User not found");
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // 2. अब इसे Approved मार्क करो
    await User.findByIdAndUpdate(id, { isApproved: true });

    // टर्मिनल में सक्सेस मैसेज चमकेगा
    console.log(
      `%c✅ [SELLER APPROVED] Name: ${user.name} | Email: ${user.email}`,
      "color: #2ecc71; font-weight: bold;",
    );

    res.status(200).json({
      success: true,
      message: `बधाई हो! ${user.name} अब एक Verified Seller है।`,
    });
  } catch (err) {
    console.error("❌ Approval Controller Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 3. Toggle Block
exports.toggleUserBlock = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[DB-ACTION] Toggle Block for ID: ${id}`);

    // 1. पहले यूजर को ढूंढो
    const user = await User.findById(id);
    if (!user) {
      console.log("❌ User not found in DB");
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // 2. स्टेटस को उल्टा करो (true -> false, false -> true)
    const newStatus = !user.isBlocked;

    // 3. सीधा DB में अपडेट मारो (findByIdAndUpdate सबसे सेफ है)
    await User.findByIdAndUpdate(id, { isBlocked: newStatus });

    console.log(
      `✅ User ${user.name} is now ${newStatus ? "BLOCKED 🚫" : "UNBLOCKED ✅"}`,
    );

    res.status(200).json({
      success: true,
      message: newStatus ? "User Blocked" : "User Unblocked",
      isBlocked: newStatus,
    });
  } catch (err) {
    console.error("❌ Block Toggle Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 4. Delete User
// यूजर अकाउंट डिलीट करने का असली लॉजिक
exports.deleteUserAccount = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. पहले चेक करो यूजर है भी या नहीं (सावधानी के लिए)
    const user = await User.findById(id);

    if (!user) {
      console.log(
        `%c❌ Delete Failed: User with ID ${id} not found!`,
        "color: red;",
      );
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // 2. अब डिलीट करो
    await User.findByIdAndDelete(id);

    // टर्मिनल में साफ़ दिखेगा कि किसका पत्ता साफ़ हुआ है
    console.log(
      `%c🗑️ [DATABASE] User Deleted: ${user.name} (${user.email})`,
      "color: #ff4d4d; font-weight: bold;",
    );

    res.status(200).json({
      success: true,
      message: `User ${user.name} has been deleted permanently!`,
    });
  } catch (err) {
    console.error("❌ Delete Controller Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// VIP स्टेटस बदलने का फंक्शन (Toggle)
exports.toggleVIPStatus = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`%c[DEBUG] VIP Toggle Hit for: ${id}`, "color: yellow;");

    const user = await User.findById(id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    // असली लॉजिक: Role और isVip दोनों को एक साथ बदलो
    if (user.role === "vip" || user.isVip === true) {
      // अगर पहले से VIP है, तो Normal Student बनाओ
      user.role = "student";
      user.isVip = false;
    } else {
      // अगर Student है, तो VIP बनाओ
      user.role = "vip";
      user.isVip = true;
    }

    await user.save();
    console.log(
      `✅ Status Updated: Role is ${user.role}, isVip is ${user.isVip}`,
    );

    res.status(200).json({
      success: true,
      newRole: user.role,
      isVip: user.isVip,
      message: `User is now ${user.role}`,
    });
  } catch (err) {
    console.error("❌ VIP Toggle Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getVIPUsers = async (req, res) => {
  try {
    const vips = await User.find({ role: "vip" });

    res.status(200).json({
      success: true,
      vips,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
// Seller Approval Toggle (Approve/Unapprove)
exports.toggleSellerApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    // स्टेटस को उल्टा (Toggle) करें
    user.isApproved = !user.isApproved;
    await user.save();

    console.log(
      `%c[DB] Seller ${user.name} Approval: ${user.isApproved}`,
      "color: #2ecc71;",
    );

    res.status(200).json({
      success: true,
      isApproved: user.isApproved,
      message: user.isApproved
        ? "Seller Approved! ✅"
        : "Seller Unapproved! ❌",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Lifetime Sales & Net Profit nikalne ka Updated function
exports.getFinancialStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let filter = { status: "success" };

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(new Date(startDate).setUTCHours(0, 0, 0, 0)),
        $lte: new Date(new Date(endDate).setUTCHours(23, 59, 59, 999)),
      };
    }

    const statsData = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          // 1. Total Gross Sales
          totalSales: { $sum: { $toDouble: "$amount" } },

          // 2. 🔥 असली Profit (Fee Collected) - सीधा DB से
          feeCollected: { $sum: { $toDouble: "$platformCommission" } },

          // 3. 🔥 असली Payout (Completed) - सीधा DB से
          totalPayout: {
            $sum: {
              $cond: [
                { $in: ["$payoutStatus", ["Completed", "paid"]] },
                { $toDouble: "$sellerEarnings" }, // 👈 80% calculate nahi, seedha DB value
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalSales: 1,
          feeCollected: 1,
          totalPayout: 1,
        },
      },
    ]);

    const result =
      statsData.length > 0
        ? statsData[0]
        : { totalSales: 0, totalPayout: 0, feeCollected: 0 };

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Financial Stats Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Payouts Fetch करने के लिए (Updated with DB Records)
exports.getFridayPayouts = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let filter = { status: "success" };

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(new Date(startDate).setUTCHours(0, 0, 0, 0)),
        $lte: new Date(new Date(endDate).setUTCHours(23, 59, 59, 999)),
      };
    }

    const payoutData = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$sellerEmail",
          sellerName: { $first: "$sellerName" },

          // 1. Due Amount (Pending Sales) - सीधा DB से Earnings उठाओ
          netDue: {
            $sum: {
              $cond: [
                { $in: ["$payoutStatus", ["pending", "Pending"]] },
                { $toDouble: "$sellerEarnings" }, // 👈 80% logic replaced
                0,
              ],
            },
          },
          // 2. Admin Commission for Due (Aapka hissa)
          adminCommission: {
            $sum: {
              $cond: [
                { $in: ["$payoutStatus", ["pending", "Pending"]] },
                { $toDouble: "$platformCommission" }, // 👈 20% logic replaced
                0,
              ],
            },
          },
          // 3. Gross Due Amount (Total Billable)
          dueAmount: {
            $sum: {
              $cond: [
                { $in: ["$payoutStatus", ["pending", "Pending"]] },
                { $toDouble: "$amount" },
                0,
              ],
            },
          },
          // 4. Already Paid (Completed Transactions)
          alreadyPaid: {
            $sum: {
              $cond: [
                { $in: ["$payoutStatus", ["Completed", "paid"]] },
                { $toDouble: "$sellerEarnings" }, // Kitna de chuke ho
                0,
              ],
            },
          },
          allProducts: { $push: "$productName" },
        },
      },
      {
        $project: {
          _id: 0,
          sellerEmail: "$_id",
          sellerName: 1,
          dueAmount: 1, // Total Sales
          adminCommission: 1, // Aapki Fee
          netDue: 1, // Jo abhi transfer karna hai
          alreadyPaid: 1,
          courses: {
            $map: {
              input: { $setUnion: "$allProducts" },
              as: "product",
              in: {
                name: "$$product",
                count: {
                  $size: {
                    $filter: {
                      input: "$allProducts",
                      as: "p",
                      cond: { $eq: ["$$p", "$$product"] },
                    },
                  },
                },
              },
            },
          },
        },
      },
    ]);

    res.status(200).json({ success: true, data: payoutData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Pay Now बटन के लिए (payoutStatus को 'Completed' मार्क करने के लिए)
exports.updatePayoutStatus = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    // 1. पेआउट डेटा एग्रीगेट करें (अब DB से असली वैल्यू उठाएगा)
    const summary = await Order.aggregate([
      {
        $match: {
          sellerEmail: email,
          status: "success",
          payoutStatus: "Pending", // 'Pending' बड़े P के साथ चेक करें (Model के हिसाब से)
        },
      },
      {
        $group: {
          _id: { email: "$sellerEmail", course: "$productName" },
          sellerName: { $first: "$sellerName" },
          quantity: { $sum: 1 },
          courseTotal: { $sum: "$amount" },
          // 🔥 DB में सेव असली कमाई और कमीशन को जोड़ें
          totalSellerEarnings: { $sum: "$sellerEarnings" },
          totalAdminCommission: { $sum: "$platformCommission" },
        },
      },
      {
        $group: {
          _id: "$_id.email",
          sellerName: { $first: "$sellerName" },
          totalSales: { $sum: "$courseTotal" },
          netPayout: { $sum: "$totalSellerEarnings" }, // ✅ असली सेव किया हुआ डेटा
          adminCommission: { $sum: "$totalAdminCommission" }, // ✅ असली सेव किया हुआ डेटा
          courses: {
            $push: {
              name: "$_id.course",
              count: "$quantity",
              total: "$courseTotal",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          sellerEmail: "$_id",
          sellerName: 1,
          totalSales: 1,
          adminCommission: 1, // अब गुणा-भाग की ज़रूरत नहीं, सीधा वैल्यू लो
          netPayout: 1, // सीधा वैल्यू लो
          courses: 1,
        },
      },
    ]);

    if (summary.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No pending orders found." });
    }

    // 2. DB में स्टेटस अपडेट करें
    await Order.updateMany(
      { sellerEmail: email, status: "success", payoutStatus: "Pending" },
      {
        $set: {
          payoutStatus: "Completed",
          payoutDate: new Date(),
          mailTrack: "SUCCESS MAIL SENT",
        },
      },
    );

    // 3. ईमेल भेजें
    sendPayoutEmail(summary[0]).catch((err) =>
      console.log("Email Error:", err),
    );

    res.status(200).json({
      success: true,
      message: "Payout updated using DB records & Mail sent!",
    });
  } catch (error) {
    console.error("Payout Update Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ईमेल भेजने का फंक्शन
const sendPayoutEmail = async (sellerData) => {
  try {
    // 1. Array handling with safety
    const data = Array.isArray(sellerData) ? sellerData[0] : sellerData;

    if (!data || !data.sellerEmail) {
      console.error("⚠️ Invalid sellerData received:", data);
      throw new Error("Invalid seller data or missing email");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 2. Formatting Course Rows (Safe Mapping)
    const coursesArr = data.courses || [];
    const courseRows =
      coursesArr.length > 0
        ? coursesArr
            .map(
              (c) => `
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-family: sans-serif; font-size: 14px;">
                    ${c.name || "Unknown Course"} <b>(x${c.count || 0})</b>
                </td>
                <td style="padding: 12px; text-align: right; font-weight: bold; font-family: sans-serif; font-size: 14px; color: #2ecc71;">
                    ₹${Number(c.total || 0).toLocaleString("en-IN")}
                </td>
            </tr>
        `,
            )
            .join("")
        : `<tr><td colspan="2" style="padding: 12px; text-align: center; color: #888;">No course details available</td></tr>`;

    // 3. Email Config
    const mailOptions = {
      from: `"BR30 Kart Admin" <${process.env.EMAIL_USER}>`,
      to: data.sellerEmail,
      // Admin copy taaki aapke paas bhi record rahe
      bcc: process.env.ADMIN_EMAIL || [],
      subject: `✅ Payment Processed: ₹${Number(data.netPayout || 0).toLocaleString("en-IN")} Credited`,
      html: payoutTemplate(data, courseRows),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Payout Email Sent to: ${data.sellerEmail}`);
    return info;
  } catch (err) {
    console.error("❌ sendPayoutEmail Error:", err.message);
    // Yahan hum error throw karenge taaki controller ko pata chale ki email fail hua
    throw err;
  }
};

// 1. Get All Sellers
exports.getAllData = async (req, res) => {
  try {
    // 1. Students aur VIPs dono ko ek saath fetch karo
    // Isse performance achhi rahegi
    const studentsAndVips = await User.find({
      role: { $in: ["student", "vip"] },
    }).sort({ createdAt: -1 });

    // 2. Sellers fetch karo
    const sellers = await User.find({ role: "seller" }).sort({ createdAt: -1 });

    // 3. Counts nikal lo
    const totalStudents = studentsAndVips.length;
    const totalSellers = sellers.length;

    // 4. Response bhejo
    res.status(200).json({
      success: true,

      // Dashboard Cards ke liye counts
      totalStudents,
      totalSellers,

      // Tables ke liye data
      // (Ab tumhare students table mein VIPs bhi dikhenge)
      students: studentsAndVips,
      sellers: sellers,
    });

    console.log(
      `📊 Data Fetched: ${totalStudents} Users (Student+VIP), ${totalSellers} Sellers`,
    );
  } catch (error) {
    console.error("Dashboard Data Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server Error: Data fetch nahi ho paya",
      error: error.message,
    });
  }
};

// 2. APPROVE / TOGGLE VERIFY (Success ✅) dane
exports.toggleVerification = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User nahi mila" });

    // toggle status
    user.isApproved = !user.isApproved;
    await user.save();

    const isApproved = user.isApproved;

    const status = isApproved ? "APPROVED" : "UNVERIFIED";
    const color = isApproved ? "#27ae60" : "#e74c3c";
    const statusEmoji = isApproved ? "✅" : "❌";

    const subject = `Account Status: ${status} ${statusEmoji}`;

    // 🔥 SELLER ID BLOCK (ONLY WHEN APPROVED)
    let sellerIdBlock = "";
    if (isApproved && user.sellerId) {
      sellerIdBlock = `
        <div style="margin-top:15px; padding:12px; border:2px dashed #27ae60; border-radius:8px; text-align:center;">
          <p style="margin:0; font-size:14px;">Your Seller ID</p>
          <h2 style="margin:5px 0; color:#27ae60;">${user.sellerId}</h2>
          <p style="font-size:12px; color:#666;">Keep this ID safe for tracking & support</p>
        </div>
      `;
    }

    const message = isApproved
      ? `
        <p>🎉 Congratulations <b>${user.name}</b>,</p>
        <p>Your account has been <b style="color:${color};">approved</b> successfully.</p>
        <p>You can now access all platform features without restrictions.</p>

        ${sellerIdBlock}  <!-- 🔥 HERE -->
      `
      : `
        <p>⚠️ Hello <b>${user.name}</b>,</p>
        <p>Your account has been marked as <b style="color:${color};">unverified</b>.</p>
        <p>Some features may be restricted until verification is completed again.</p>
      `;

    const body = `
      ${message}

      <div style="margin-top:15px; padding:12px; border-left:4px solid ${color}; background:${color}15; border-radius:6px;">
        <b>Current Status: ${status} ${statusEmoji}</b>
      </div>

      <p style="margin-top:15px;">
        If you have any query, you can contact our support team.
      </p>
    `;

    await sendNotificationEmail(
      user.email,
      subject,
      "Seller Account Update",
      body,
      color,
    );

    res.json({
      success: true,
      msg: `Account ${status} ${statusEmoji}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
};

// 2. REJECT (With Email)
exports.rejectSellerDocs = async (req, res) => {
  try {
    const { userId, email, reason } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User nahi mila" });

    // 1. Update Database Status
    user.isApproved = false;
    user.isRejected = true;
    await user.save();

    // 2. Generate Your Custom Template HTML
    const emailBody = rejectDocsTemplate(user.name, reason);

    // 3. 🔥 Send using the generic 'sendEmail' function
    // Isse aapka design 100% waisa hi rahega jaisa aapne maanga hai
    await sendEmail({
      to: email,
      subject: "Verification Result ❌ - Documents Rejected",
      html: emailBody, // Direct aapka custom HTML jayega
    });

    res.json({
      success: true,
      msg: "Seller rejected + email sent successfully ✅",
    });
  } catch (err) {
    console.error("🔥 Rejection Error:", err);
    res.status(500).json({ msg: "Server error during rejection" });
  }
};

// 📊 1. Saare Products Fetch Karna
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Server Error: Data nahi mil raha" });
  }
};

// ✅ 1. असली Approval कंट्रोलर (जो Approve/Reject करेगा)
exports.approveProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ msg: "Course nahi mila bhai!" });

    // Status toggle for Approval
    product.isApproved = !product.isApproved;
    await product.save();

    res.json({
      success: true,
      msg: `Course is now ${product.isApproved ? "Approved ✅" : "Rejected ❌"}`,
      status: product.isApproved,
    });
  } catch (err) {
    res.status(500).json({ error: "Approval toggle failed" });
  }
};

// ✅ 2. HIDE/SHOW Controller (Sahi Name: toggleVisibility)
exports.toggleVisibility = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ success: false, msg: "Course nahi mila!" });

    // Status toggle for Store Visibility
    product.isVisible = product.isVisible === true ? false : true;

    await product.save();

    res.json({
      success: true,
      isVisible: product.isVisible,
      msg: product.isVisible
        ? "Course is now Visible on Store 👁️"
        : "Course is now Hidden 🚫",
    });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};

// 🎟️ 2. Delete/Reset Coupon (Set discount to 0)
exports.resetCourseDiscount = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { discount: 0 }, // Discount zero kar diya
      { new: true },
    );

    if (!product) return res.status(404).json({ msg: "Course nahi mila!" });

    res.json({
      success: true,
      msg: "Course discount/coupon reset ho gaya! ⚡",
    });
  } catch (err) {
    res.status(500).json({ error: "Coupon reset failed" });
  }
};

// 🗑️ 3. Course Delete karna
exports.deleteCourse = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ msg: "Course parmanently delete ho gaya!" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
};

// 💰 GET ALL ORDERS (Master Admin Logic)
exports.getAllOrders = async (req, res) => {
  try {
    // Note: Agar aapne Order model alag banaya hai toh wahi use karein
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Order fetch failed!" });
  }
};

// 📦 GET SINGLE ORDER DETAILS
exports.getOrderDetail = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res
        .status(404)
        .json({ msg: "Bhai, ye order database mein nahi mila!" });
    }

    res.json(order);
  } catch (err) {
    console.error("❌ Order Detail Error:", err);
    res.status(500).json({ error: "Server Error: Detail fetch nahi ho payi" });
  }
};

// 1. Pending Seller Requests Fetch karne ka logic (seller request click btn)
exports.getPendingSellers = async (req, res) => {
  try {
    // Atlas Query: Role 'seller' ho aur isApproved 'false' ho
    const pendingSellers = await User.find({
      role: "seller",
      isApproved: false,
    })
      .select("-password")
      .sort({ createdAt: -1 }); // Nayi requests upar dikhengi

    res.status(200).json({
      success: true,
      count: pendingSellers.length,
      sellers: pendingSellers,
    });
  } catch (err) {
    console.error("Error fetching pending sellers:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// get seller details (seller request click) btn
exports.getSellerDetails = async (req, res) => {
  try {
    const seller = await User.findById(req.params.id).select(
      "kycDetails bankDetails name email",
    );
    res.json({ success: true, seller });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching data" });
  }
};

// reject seller (seller request click btn)
exports.rejectSeller = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, reason } = req.body; // Frontend se tick + manual reason aa raha hai

    // 1. Database Update (Atlas)
    const seller = await User.findByIdAndUpdate(
      id,
      { isApproved: false, isRejected: true },
      { new: true },
    );

    if (!seller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }

    // 2. Prepare Email Template (Utils se fetch kiya hua)
    const htmlTemplate = rejectSellerTemplate(seller.name, reason);

    // 3. 🔥 Send Email using your sendEmail function (Not transporter directly)
    console.log(`🚀 Sending rejection mail to: ${email}...`);

    await sendEmail({
      to: email,
      subject: "❌ Action Required: Your Seller Application Status",
      html: htmlTemplate,
    });

    res.status(200).json({
      success: true,
      message: "Seller Rejected & Custom Mail Sent! 📧",
    });
  } catch (err) {
    console.error("🔥 Critical Rejection Error:", err.message);
    res.status(500).json({
      success: false,
      message: "Server Error: Could not complete rejection process.",
    });
  }
};

// approve (seller request click btn)
exports.approveSeller = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Database update
    const seller = await User.findByIdAndUpdate(
      id,
      { isApproved: true },
      { new: true },
    );

    if (!seller)
      return res
        .status(404)
        .json({ success: false, message: "Seller not found!" });

    // 2. Template taiyar karo
    const htmlContent = approvalTemplate(seller.name);

    // 3. 🔥 Yahan 'transporter.sendMail' ki jagah 'sendEmail' use karo
    // Kyunki aapne utils mein saara logic 'sendEmail' ke andar likha hai
    await sendEmail({
      to: seller.email,
      subject: "🎉 Congratulations! Your Seller Account is Approved",
      html: htmlContent,
    });

    res.status(200).json({
      success: true,
      message: "Seller Approved & Professional Mail Sent! 🚀",
    });
  } catch (err) {
    console.error("🔥 Error:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Server Error: " + err.message });
  }
};

// Get All Sellers with Course Count & List
exports.getSellerTracker = async (req, res) => {
  try {
    const sellers = await User.aggregate([
      { $match: { role: "seller" } },
      {
        $lookup: {
          from: "products",
          localField: "email",
          foreignField: "sellerEmail",
          as: "courses",
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          lastLogin: 1,
          isBlocked: 1,
          courseCount: { $size: "$courses" },
          // 🔥 Sabhi details nikal rahe hain (Photo me jo dikh raha hai)
          courseList: {
            $map: {
              input: "$courses",
              as: "c",
              in: {
                id: "$$c._id",
                title: "$$c.title",
                price: "$$c.price",
                category: "$$c.category",
                discount: "$$c.discount",
                thumbnail: "$$c.thumbnail",
                createdAt: "$$c.createdAt",
              },
            },
          },
        },
      },
    ]);
    res.json(sellers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
};

// send alart mail sseller
exports.sendSellerAlert = async (req, res) => {
  try {
    const { email, name, message } = req.body;

    // 🔥 Asli Mail Engine Trigger
    await sendEmail({
      to: email,
      subject: "⚠️ IMPORTANT: BR30 Admin Alert",
      html: sellerAlertTemplate(name, message), // Naya wala elite template
    });

    console.log(`📧 Alert sent to: ${email}`);
    res.json({ success: true, msg: "Alert Email Dispatched!" });
  } catch (err) {
    console.error("Mail Error:", err.message);
    res.status(500).json({ success: false, msg: "Mail failed to send!" });
  }
};

// Toggle Block Status for Seller
exports.toggleBlockSeller = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: "User nahi mila!" });

    // 🔥 Toggle logic: Agar true hai toh false, false hai toh true
    user.isBlocked = !user.isBlocked;

    await user.save();

    console.log(
      `🚫 Status Updated: ${user.email} is now ${user.isBlocked ? "Blocked" : "Active"}`,
    );

    res.json({ success: true, isBlocked: user.isBlocked });
  } catch (err) {
    res.status(500).json({ msg: "Server Error: " + err.message });
  }
};

// 2. Delete User Logic
exports.deleteSeller = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, msg: "User deleted from DB" });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};

// ✅ Feature/Unfeature Course (Best Seller Logic)
exports.toggleFeatured = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, msg: "Product not found!" });

    // isFeatured को उल्टा कर दो
    product.isFeatured = product.isFeatured === true ? false : true;
    await product.save();

    res.json({
      success: true,
      isFeatured: product.isFeatured,
      msg: product.isFeatured
        ? "Marked as Best Seller 🔥"
        : "Removed from Best Seller",
    });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};

// bulk action  (course controll pannel)
// controllers/adminController.js
exports.bulkUpdateCourses = async (req, res) => {
  try {
    const { ids, action } = req.body;

    // Console mein check karein data aa raha hai ya nahi (Debugging ke liye)
    console.log("Bulk Action Received:", { action, idsCount: ids?.length });

    if (!ids || ids.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No IDs provided" });
    }

    // 🗑️ DELETE Logic
    if (action === "delete") {
      await Product.deleteMany({ _id: { $in: ids } });
      return res.json({ success: true, message: "Selected courses deleted!" });
    }

    // 🛠️ UPDATE Logic
    const actionsMap = {
      approve: { isApproved: true },
      unapprove: { isApproved: false },
      hide: { isVisible: false },
      unhide: { isVisible: true },
      bestseller: { isFeatured: true },
      remove_bestseller: { isFeatured: false },
      del_coupon: { discount: 0 },
    };

    const updateData = actionsMap[action];

    if (!updateData) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid action selected" });
    }

    // 🔥 MAIN FIX: Check karein 'Product' yahan wahi hai jo upar import kiya hai
    await Product.updateMany({ _id: { $in: ids } }, { $set: updateData });

    res.json({
      success: true,
      message: `Applied ${action} to ${ids.length} items!`,
    });
  } catch (error) {
    // 🚩 Server console (Terminal) mein error print hogi
    console.error("❌ BACKEND CRASH ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// seller alart message mail (course managment pannel )
exports.sendSellerActionMail = async (req, res) => {
  try {
    // 🚩 FIX: req.body se sellerName nikalna zaroori tha
    const { sellerEmail, sellerName, reason, message, courseId, courseTitle } =
      req.body;

    console.log("📩 Attempting to Notify Seller:", sellerEmail);

    // 📩 1. Template mein data bharna (Fixed variables)
    const htmlContent = sellerAlertTemplate2({
      userName: sellerName || "Valued Seller", // Ab error nahi aayegi
      reason: reason,
      alertMessage: message || "No extra message provided by Admin.",
      courseTitle: courseTitle, // Agar template use kar raha hai
    });

    // 🚀 2. Email bhejna
    await sendEmail({
      email: sellerEmail,
      subject: `🚨 Admin Action: ${reason} (${courseTitle || "Update"})`,
      html: htmlContent,
    });

    console.log("✅ Mail Sent Successfully to:", sellerEmail);
    res.json({ success: true, message: "Seller notified successfully! 📧" });
  } catch (error) {
    console.error("❌ Mail Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Mail failed: " + error.message });
  }
};

// 👥 Bulk Update Users (admin dashbord.html)
exports.bulkUpdateUsers = async (req, res) => {
  try {
    const { ids, action } = req.body;

    // 1. Validation
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Bhai, kam se kam ek user toh select karo!",
      });
    }

    const queryIds = { _id: { $in: ids } };

    // 2. Role-Based Database Operations
    switch (action) {
      // --- 🏪 SELLER CONTROL ---
      case "approve_seller":
        await User.updateMany(
          { ...queryIds, role: "seller" },
          { $set: { isApproved: true } },
        );
        break;
      case "unapprove_seller":
        await User.updateMany(
          { ...queryIds, role: "seller" },
          { $set: { isApproved: false } },
        );
        break;
      case "block_seller":
        await User.updateMany(
          { ...queryIds, role: "seller" },
          { $set: { isBlocked: true } },
        );
        break;
      case "unblock_seller":
        await User.updateMany(
          { ...queryIds, role: "seller" },
          { $set: { isBlocked: false } },
        );
        break;
      case "delete_seller":
        await User.deleteMany({ ...queryIds, role: "seller" });
        break;

      // --- 💎 VIP CONTROL (Role Switch, Block, Delete) ---
      case "make_vip":
        await User.updateMany(queryIds, { $set: { role: "vip", isVip: true } });
        break;
      case "remove_vip":
        // VIP hata kar wapas Student role set kar rahe hain
        await User.updateMany(
          { ...queryIds, role: "vip" },
          { $set: { role: "student", isVip: false } },
        );
        break;
      case "block_vip":
        await User.updateMany(
          { ...queryIds, role: "vip" },
          { $set: { isBlocked: true } },
        );
        break;
      case "unblock_vip":
        await User.updateMany(
          { ...queryIds, role: "vip" },
          { $set: { isBlocked: false } },
        );
        break;
      case "delete_vip":
        await User.deleteMany({ ...queryIds, role: "vip" });
        break;

      // --- 🎓 STUDENT CONTROL (Block, Delete, Certificate) ---
      case "block_student":
        await User.updateMany(
          { ...queryIds, role: "student" },
          { $set: { isBlocked: true } },
        );
        break;
      case "unblock_student":
        await User.updateMany(
          { ...queryIds, role: "student" },
          { $set: { isBlocked: false } },
        );
        break;
      case "delete_student":
        await User.deleteMany({ ...queryIds, role: "student" });
        break;
      case "reject_cert":
        await User.updateMany(queryIds, {
          $set: { isCertified: false, "certificateData.status": "Rejected" },
        });
        break;

      // --- 💀 DANGER ZONE ---
      case "delete_all":
        await User.deleteMany(queryIds);
        break;

      case "make_seller":
        // User ka role badal kar 'seller' kar dega aur approval reset rakhega (ya true kar sakte ho)
        await User.updateMany(queryIds, {
          $set: { role: "seller", isVip: false, isApproved: true },
        });
        break;

      default:
        return res
          .status(400)
          .json({ success: false, message: "Invalid action selected!" });
    }

    res.json({
      success: true,
      message: `Bulk Action '${action}' successfully processed for selected users! 🔥`,
    });
  } catch (error) {
    console.error("❌ Bulk User Update Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error! " + error.message });
  }
};

// hide course user my course.html ( student active pannel )
// --- 1. Get Students with Data ---
exports.getStudentTrackerData = async (req, res) => {
  try {
    console.log("📡 Fetching students for tracker...");

    // FIX: Pehle bina populate ke check karo data aa raha hai ya nahi
    // Role check karo: 'student' small case hai ya Capital 'Student'? DB ke hisaab se check karein.
    const students = await User.find({
      role: { $in: ["student", "vip", "STUDENT", "VIP"] },
    })
      .populate("purchasedCourses", "title thumbnail price")
      .select("-password")
      .sort({ lastLogin: -1 });

    console.log(`✅ Found ${students.length} students in DB`);

    res.json({
      success: true,
      students: students,
    });
  } catch (err) {
    console.error("❌ Tracker API Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- 2. Toggle Hide Course ---
exports.toggleHideCourse = async (req, res) => {
  try {
    const { userId, courseId } = req.body;
    const user = await User.findById(userId);

    const isHidden = user.hiddenCourses.some(
      (h) => h.courseId.toString() === courseId,
    );

    if (isHidden) {
      // Unhide: Array se hata do
      user.hiddenCourses = user.hiddenCourses.filter(
        (h) => h.courseId.toString() !== courseId,
      );
    } else {
      // Hide: Array mein add kardo
      user.hiddenCourses.push({ courseId });
    }

    await user.save();
    res.json({
      success: true,
      message: isHidden ? "Course Unhidden! 👁️" : "Course Hidden! 🚫",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- 3. Delete Course from Student ---
exports.deleteStudentCourse = async (req, res) => {
  try {
    const { userId, courseId } = req.body;

    await User.findByIdAndUpdate(userId, {
      $pull: {
        purchasedCourses: courseId,
        hiddenCourses: { courseId: courseId },
      },
    });

    res.json({
      success: true,
      message: "Course removed from student library! 🗑️",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- 4. Send Alart mail student/vip
exports.sendStudentAlert = async (req, res) => {
  try {
    const { userId, studentEmail, studentName, message, reason } = req.body;

    console.log("📩 Sending Alert to Student:", studentEmail);

    // 1. Template mein data bharna
    const htmlContent = sellerAlertTemplate2({
      userName: studentName || "Student",
      reason: reason || "Account Update",
      alertMessage:
        message || "Bhai, admin ki taraf se aapke liye ek zaroori message hai.",
    });

    // 2. Email bhejna
    await sendEmail({
      email: studentEmail,
      subject: `🚨 Important Update: ${reason || "Admin Message"}`,
      html: htmlContent,
    });

    res.json({ success: true, message: "Student notified successfully! 📧" });
  } catch (error) {
    console.error("❌ Student Alert Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Mail failed: " + error.message });
  }
};

//#endregion
