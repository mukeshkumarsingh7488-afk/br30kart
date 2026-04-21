//#region Course Routes

const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

// ✅ ONLY CLOUDINARY
const uploadCloud = require("../middleware/multerCloudinary");

const {
  createCourse,
  getCourses,
  getMyCourses,
  addVideo,
  getCourseById,
  purchaseCourse,
  getLeaderboard,
  updateCourse,
  deleteCourse,
} = require("../controllers/courseController");

// 1. Leaderboard
router.get("/leaderboard", getLeaderboard);

// 3. Get All Courses
router.get("/", getCourses);

// 4. Get User's Purchased Courses
router.get("/my-courses", auth, getMyCourses);

// 5. Purchase Course
router.post("/purchase/:id", auth, purchaseCourse);

// 6. Get Single Course Detail
router.get("/:id", auth, getCourseById);

// 7. Add Video to Course (Admin Only)
router.put("/add-video/:id", auth, admin, addVideo);

// 🚀 8. UPDATE COURSE (ONLY ONE ROUTE)
router.put(
  "/update-course/:id",
  auth,
  admin,
  uploadCloud.single("thumbnail"),
  updateCourse,
);

// 🗑️ 9. DELETE COURSE
router.delete("/delete-course/:id", auth, admin, deleteCourse);

module.exports = router;

//#endregion
