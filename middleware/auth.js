// Ye middleware ensure karega ki jo bhi request aayegi usme ek valid JWT token hoga.
// Isme hum token ko verify karenge aur usme se user data nikal ke req.user me daal denge, taki aage ke controllers me use kar sakein.
const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // 1. दोनों तरीके से टोकन चेक करें (ताकि कोई एरर न आए)
  let token = req.header("Authorization") || req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    // 2. अगर टोकन "Bearer <token>" फॉर्मेट में है, तो सिर्फ टोकन निकालें
    if (token.startsWith("Bearer ")) {
      token = token.split(" ")[1];
    }

    // 3. Verify करें (Secret Key वही रखें जो index.js में है)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "test_secret");

    // 4. यूजर डेटा को रिक्वेस्ट में डालें
    // पक्का करें कि आपके टोकन में 'user' ऑब्जेक्ट है या सीधा 'id'
    req.user = decoded.user || decoded;

    next();
  } catch (err) {
    console.error("Auth Error:", err.message);
    res.status(401).json({ msg: "Token is not valid" });
  }
};
