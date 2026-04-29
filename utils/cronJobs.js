const cron = require("node-cron");
const Product = require("../models/Product");

const startDiscountCleanup = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      const expiryThreshold = 7 * 24 * 60 * 60 * 1000;

      const expiredProducts = await Product.updateMany(
        {
          discount: { $gt: 0 },
          $expr: {
            $gt: [
              {
                $subtract: [
                  now,
                  { $ifNull: ["$couponCreatedAt", "$createdAt"] },
                ],
              },
              expiryThreshold,
            ],
          },
        },
        { $set: { discount: 0 } },
      );

      if (expiredProducts.modifiedCount > 0) {
        console.log(
          `✅ DB Cleanup: ${expiredProducts.modifiedCount} products ka discount 0 kiya gaya.`,
        );
      }
    } catch (err) {
      console.error("❌ Cron Job Error:", err);
    }
  });
};

module.exports = startDiscountCleanup;
