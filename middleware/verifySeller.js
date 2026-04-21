// seller security cheak
module.exports = function verifySeller(req, res, next) {
  try {
    // 🔥 BASIC AUTH CHECK
    if (!req.user) {
      return res.status(401).json({ msg: "Not logged in" });
    }

    // 🔥 ROLE CHECK (ONLY SELLER OR ADMIN)
    if (req.user.role !== "seller" && req.user.role !== "admin") {
      return res.status(403).json({ msg: "Seller access only" });
    }

    // 🔥 SELLER ID SAFETY CHECK (optional strong security)
    if (req.body.sellerId && req.user.sellerId !== req.body.sellerId) {
      return res.status(403).json({ msg: "Seller ID mismatch" });
    }

    // 🔥 EMAIL CHECK (backup security)
    if (req.body.sellerEmail && req.user.email !== req.body.sellerEmail) {
      return res.status(403).json({ msg: "Seller email mismatch" });
    }

    next();
  } catch (err) {
    return res.status(500).json({ msg: "Server error in seller check" });
  }
};
