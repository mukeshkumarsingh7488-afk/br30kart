// br30 kart
const Review = require("../models/Review");
const User = require("../models/User");
const mongoose = require("mongoose");
const { generateSmartReply } = require("../utils/reviewReply");
//#endregion

//#region POST REVIEW (Show Web Page)
// 1. POST REVIEW (Isme ab sirf ID save karenge, photo nahi)
exports.postReview = async (req, res) => {
  try {
    const { rating, comment, userId } = req.body;

    // 1. Check if user already reviewed
    const existingReview = await Review.findOne({ userId: userId });
    if (existingReview) {
      return res
        .status(400)
        .json({ message: "You have already submitted a review!" });
    }

    // 2. User ki details nikal lo
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User nahi mila!" });

    const newReview = new Review({
      userId,
      username: user.name,
      rating,
      comment,
    });

    await newReview.save();

    // 🔥 3. Naya Count nikal kar sabhi users ko bhej do (Real-time)
    const updatedCount = await Review.countDocuments();

    // Check karo agar 'io' accessible hai (usually global ya req.app.get se)
    if (req.app.get("socketio")) {
      req.app.get("socketio").emit("updateReviewCount", updatedCount);
    }

    res.status(201).json({
      message: "Review Saved Successfully! ✅",
      totalCount: updatedCount, // Saath mein count bhi bhej rahe hain
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//#endregion

//#region GET USER REVIEWS (User ke apne reviews dekhne ke liye)
// ==========================================
// 2. GET TOP REVIEWS (User Webpage Fix)
// ==========================================

exports.getTopReviews = async (req, res) => {
  try {
    const totalReviewCount = await Review.countDocuments();

    const reviews = await Review.aggregate([
      {
        $match: {
          $or: [{ status: "approved" }, { status: { $exists: false } }],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$username",
          latestReview: { $first: "$$ROOT" },
        },
      },
      { $replaceRoot: { newRoot: "$latestReview" } },
      {
        // 🔥 userId को ObjectId में कन्वर्ट करें ताकि Lookup मैच हो सके
        $addFields: {
          userId: { $toObjectId: "$userId" },
        },
      },
      {
        $lookup: {
          from: "users", // पक्का करें कि DB में नाम 'users' ही है (lowercase)
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } },
    ]);

    // ✅ डेटा भेजने से पहले चेक करें कि कहीं एम्प्टी तो नहीं आ रहा
    res.status(200).json({
      success: true,
      totalCount: totalReviewCount || 0,
      reviews: reviews || [],
    });
  } catch (err) {
    console.error("Aggregation Error:", err);
    res.status(500).json({ error: err.message });
  }
};

//#endregion

//#region ADMIN REVIEW MANAGEMENT (Admin Panel ke liye APIs)
// 1. GET ALL REVIEWS (Admin Panel ke liye saara data)
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("userId", "name profilePic") // Latest photo ke liye
      .sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//#endregion

//#region UPDATE/REPLY REVIEW (Admin Panel ke liye review ka status badalne ya reply dene ke liye)
// 2. UPDATE/REPLY REVIEW (Status badalne ya reply dene ke liye)
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminReply } = req.body; // Status 'approved'/'hidden' ho sakta hai

    const updatedReview = await Review.findByIdAndUpdate(
      id,
      { status, adminReply },
      { new: true },
    );

    if (!updatedReview)
      return res.status(404).json({ message: "Review nahi mila!" });
    res
      .status(200)
      .json({ message: "Review Update Ho Gaya! ✅", updatedReview });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//#endregion

//#region DELETE REVIEW (Admin Panel ke liye review permanently delete karne ke liye)
// 3. DELETE REVIEW (Permanent hatane ke liye)
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedReview = await Review.findByIdAndDelete(id);

    if (!deletedReview)
      return res
        .status(404)
        .json({ message: "Review pehle hi delete ho chuka hai!" });
    res.status(200).json({ message: "Review Parmanent Delete Kar Diya! 🗑️" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//#endregion

//#region TOGGLE REVIEW STATUS (Admin Panel ke liye review ko hide/show karne ke liye)
// 6. TOGGLE STATUS (Hide/Show karne ke liye)
exports.toggleReviewStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Pehle purana status nikal lo
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: "Review nahi mila!" });

    // Agar 'approved' hai toh 'hidden' kar do, aur vice versa
    const newStatus = review.status === "approved" ? "hidden" : "approved";

    review.status = newStatus;
    await review.save();

    res.status(200).json({
      message: `Review ab ${newStatus} ho gaya hai! ✅`,
      status: newStatus,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//#endregion

// 👉 DB update (yaha apna real DB logic laga)
async function saveReply(reviewId, message) {
  try {
    await Review.findOneAndUpdate(
      { _id: reviewId, adminReply: { $in: ["", null] } }, // 🔥 overwrite na kare
      {
        adminReply: message, // ✅ yahi field use kar
        replied: true,
      },
    );

    console.log("✅ Reply saved:", reviewId);
  } catch (err) {
    console.error("❌ Error saving reply:", err);
  }
}

// 🔥 AUTO (API ke liye bhi aur reuse bhi ho sakta hai)
exports.handleAutoReply = async (req, res) => {
  try {
    const reviews = req.body.reviews;

    for (let review of reviews) {
      if (review.replied) continue; // ❌ skip already replied

      const reply = generateSmartReply(review);

      if (!reply) {
        console.log("⚠️ Manual needed:", review._id); // ✅ fix
        continue;
      }

      const finalReply = reply + "\n— Team BR30 Trader Academy 🚀";

      // 🔥 FIXED (id → _id)
      await saveReply(review._id, finalReply);
    }

    res.json({ success: true, message: "Auto replies processed 🚀" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
