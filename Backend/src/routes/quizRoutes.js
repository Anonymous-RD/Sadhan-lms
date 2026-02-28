const express = require("express");
const router = express.Router();
const { submitQuiz } = require("../controllers/quizController");
const { protect } = require("../middleware/auth");

// This is DEMO v0 implementation

router.post("/submit", protect, submitQuiz);

module.exports = router;
