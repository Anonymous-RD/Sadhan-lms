const express = require("express");
const router = express.Router();
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require("../controllers/wishlistController");
const { protect } = require("../middleware/auth");

// This is DEMO v0 implementation

router.get("/", protect, getWishlist);
router.post("/:courseId", protect, addToWishlist);
router.delete("/:courseId", protect, removeFromWishlist);

module.exports = router;
