const express = require("express");
const router = express.Router();
const {
  getCourses,
  getCourseById,
} = require("../controllers/courseController");
const { protect } = require("../middleware/auth");

// This is DEMO v0 implementation

router.route("/").get(protect, getCourses);
router.route("/:id").get(protect, getCourseById);

module.exports = router;
