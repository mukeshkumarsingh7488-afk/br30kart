const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const adminController = require("../controllers/adminController");
console.log("DEBUG:", adminController.getAdminDashboardData);

// Sabhi routes ke liye Admin hona zaroori hai ( Seruty cheak )
const adminCheck = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ msg: "Sirf Mukesh King allowed hain!" });
  }
  next();
};

// 🟢 [GET] डैशबोर्ड का सारा डेटा लाने के लिए
console.log("🚀 Admin Route: GET /all-data initialized");
router.get("/all-sellers-docs", adminController.getAllSellersDocs);

// 🟣 [PUT] Student को VIP बनाने या वापस Student करने के लिए (Toggle)
console.log("🚀 Admin Route: PUT /toggle-vip/:id initialized");
router.put("/toggle-vip/:id", adminController.toggleVIPStatus);

// 🟠 [PUT] यूजर को Block/Unblock करने के लिए
router.put("/toggle-block/:id", adminController.toggleUserBlock);

// 🔵 [PUT] सेलर रिक्वेस्ट Approved करने के लिए
router.put("/approve-seller/:id", adminController.approveSeller);

// 🔴 [DELETE] यूजर अकाउंट उड़ाने के लिए
router.delete("/delete-user/:id", adminController.deleteUserAccount);

// सेलर अप्रूवल टॉगल
router.put("/toggle-seller-approval/:id", adminController.toggleSellerApproval);

router.get("/financial-stats", adminController.getFinancialStats);

router.get("/friday-payouts", adminController.getFridayPayouts);

router.post("/update-payout-status", adminController.updatePayoutStatus);

router.put("/toggle-seller-status", adminController.toggleVerification); // Ye backend-frontend match karega
router.post("/reject-seller", adminController.rejectSellerDocs);
router.get("/all-data", adminController.getAllData);
router.get("/all-vips", adminController.getVIPUsers);
// 🛣️ Raaste (Endpoints)
router.get("/products", auth, adminCheck, adminController.getAllProducts);
router.get("/seller-requests", adminController.getPendingSellers);
router.get("/seller-details/:id", adminController.getSellerDetails);
router.put("/reject-seller/:id", adminController.rejectSeller);
router.get("/seller-tracker", auth, adminController.getSellerTracker);
router.post("/send-seller-alert", auth, adminController.sendSellerAlert);
router.put("/approve-product/:id", auth, adminController.approveProduct);
router.put("/toggle-visibility/:id", auth, adminController.toggleVisibility);
router.put("/toggle-featured/:id", auth, adminController.toggleFeatured);
router.put("/bulk-update-courses", auth, adminController.bulkUpdateCourses);
// 👨‍🎓 STUDENT ACTIVITY TRACKER ROUTES

// 1. Sare Students fetch karne ke liye (With populated courses)
router.get(
  "/student-tracker-data",
  auth,
  adminCheck,
  adminController.getStudentTrackerData,
);

// 2. Student ke dashboard se course HIDE/UNHIDE karne ke liye
router.put(
  "/toggle-hide-course",
  auth,
  adminCheck,
  adminController.toggleHideCourse,
);

// 3. Student ke account se course DELETE karne ke liye
router.put(
  "/delete-student-course",
  auth,
  adminCheck,
  adminController.deleteStudentCourse,
);

// 4. Student ko Elite Alert Mail bhejne ke liye
router.post(
  "/send-student-alert",
  auth,
  adminCheck,
  adminController.sendStudentAlert,
);

// bulk update user
router.put(
  "/bulk-update-users",
  auth,
  adminCheck,
  adminController.bulkUpdateUsers,
);
// seller email alart active seller panner
router.post(
  "/send-seller-action-mail",
  auth,
  adminController.sendSellerActionMail,
);

// block seller active seller pannel
router.put(
  "/toggle-block-seller/:email",
  auth,
  adminController.toggleBlockSeller,
);
router.delete("/delete-seller/:email", auth, adminController.deleteSeller);

// 2. reset coupon
router.put(
  "/reset-coupon/:id",
  auth,
  adminCheck,
  adminController.resetCourseDiscount,
);

// 3. Delete Course
router.delete(
  "/delete-course/:id",
  auth,
  adminCheck,
  adminController.deleteCourse,
);

router.get("/orders", auth, adminCheck, adminController.getAllOrders);

// adminRoutes.js mein ye line add karo
router.get(
  "/order-details/:id",
  auth,
  adminCheck,
  adminController.getOrderDetail,
);

module.exports = router;
