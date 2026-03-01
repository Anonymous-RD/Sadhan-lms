const express = require("express");
const router = express.Router();
const {
  getProgress,
  completeModule,
  enrollCourse,
} = require("../controllers/progressController");
const { protect } = require("../middleware/auth");

// This is DEMO v0 implementation

router.post("/enroll", protect, enrollCourse);
router.post("/complete-module", protect, completeModule);
router.get("/:courseId", protect, getProgress);

module.exports = router;
