const express = require("express");
const router = express.Router();
const { login, verifyOtp, register } = require("../controllers/authController");

// This is DEMO v0 implementation

router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.post("/register", register);

module.exports = router;
