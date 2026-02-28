const express = require("express");
const router = express.Router();
const { generateCertificate } = require("../controllers/certificateController");
const { protect } = require("../middleware/auth");

// This is DEMO v0 implementation

router.get("/:courseId", protect, generateCertificate);

module.exports = router;
