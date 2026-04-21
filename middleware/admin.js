//#region Admin Middleware
// Ye middleware ensure karega ki jo bhi request aayegi usme ek valid JWT token hoga. 
// Isme hum token ko verify karenge aur usme se user data nikal ke req.user me daal denge, taki aage ke controllers me use kar sakein.
// Aur sabse important, is middleware me hum database se user ka role check karenge, taki koi bhi user apne token ke through admin access na le sake.
const User = require("../models/User"); 

module.exports = async function (req, res, next) {
  try {
    // 2. Token se User ID lo (Jo auth middleware ne set ki hai)
    const userId = req.user.id;

    // 3. Database se FRESH Data nikalo (Re-check logic)
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ msg: "User nahi mila bhai!" });
    }

    console.log("🔥 DB Fresh Role:", user.role);

    // 4. ASLI CHECK: Ab Database wala role check hoga
    if (user.role !== "admin") {
      return res.status(403).json({ msg: "Access denied. Admin only! 🛑" });
    }

    // Sab sahi hai toh aage badho
    next();
  } catch (err) {
    console.error("❌ Admin Middleware Error:", err.message);
    res.status(500).json({ error: "Server Error: Admin check fail ho gaya" });
  }
};
//#endregion