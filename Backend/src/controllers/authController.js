const User = require("../models/User");
const jwt = require("jsonwebtoken");

// This is DEMO v0 implementation

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Auth user & get OTP response
// @route   POST /auth/login
// @access  Public
const login = async (req, res) => {
  const { email, password, phoneNumber } = req.body;
  const loginIdentifier = email || phoneNumber;

  try {
    const user = await User.findOne({
      $or: [{ email: loginIdentifier }, { phoneNumber: loginIdentifier }],
    });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", notFound: true });
    }

    if (await user.matchPassword(password)) {
      // User verified, send OTP response instead of token
      res.json({
        message: "Password verified. Please enter OTP to continue.",
        userId: user._id,
        requireOtp: true,
      });
    } else {
      res.status(401).json({ message: "Invalid password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Verify static OTP and issue token
// @route   POST /auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
  const { userId, otp } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (otp === "123456") {
      res.json({
        _id: user._id,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
        message: "Authentication successful",
      });
    } else {
      res.status(400).json({ message: "Invalid OTP" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Register a new user
// @route   POST /auth/register
// @access  Public
const register = async (req, res) => {
  const { name, email, password, phoneNumber, role } = req.body;

  if (!name || !email || !password || !phoneNumber) {
    return res
      .status(400)
      .json({
        message:
          "Please provide all required fields (name, email, password, phoneNumber)",
      });
  }

  try {
    const userExists = await User.findOne({
      $or: [{ email }, { phoneNumber }],
    });

    if (userExists) {
      const field = userExists.email === email ? "Email" : "Phone number";
      return res.status(400).json({ message: `${field} already registered` });
    }

    const user = await User.create({
      name,
      email,
      password,
      phoneNumber,
      role: role || "learner",
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  login,
  register,
  verifyOtp,
};
