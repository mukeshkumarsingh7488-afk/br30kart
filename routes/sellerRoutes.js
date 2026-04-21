// routes/sellerRoutes.js
const express = require("express");
const router = express.Router();
const sellerController = require("../controllers/sellerController");

// Analytics fetch karne ka route
router.get("/analytics", sellerController.getSellerAnalytics);

router.get("/sales-records", sellerController.getSellerSalesRecords);

router.get("/sales-records", sellerController.getSellerSalesRecords);
router.get("/bestsellers-data", sellerController.getBestSellers);
module.exports = router;
