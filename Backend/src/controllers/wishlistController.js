const Course = require("../models/Course");
const Wishlist = require("../models/Wishlist");

// This is DEMO v0 implementation

// @desc    Get current user's wishlist
// @route   GET /wishlist
// @access  Private
const getWishlist = async (req, res) => {
  try {
    const wishlistEntries = await Wishlist.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate(
        "courseId",
        "title description language category youtubeVideoUrl createdBy modules",
      );

    const courses = wishlistEntries
      .filter((entry) => Boolean(entry.courseId))
      .map((entry) => ({
        ...entry.courseId.toObject(),
        wishlistId: entry._id,
        wishlistedAt: entry.createdAt,
        isWishlisted: true,
      }));

    return res.json(courses);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// @desc    Add course to current user's wishlist
// @route   POST /wishlist/:courseId
// @access  Private
const addToWishlist = async (req, res) => {
  const { courseId } = req.params;

  try {
    const course = await Course.findById(courseId).select(
      "title description language category youtubeVideoUrl createdBy modules",
    );
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const existing = await Wishlist.findOne({ userId: req.user._id, courseId });
    if (existing) {
      return res.status(200).json({
        message: "Course already in wishlist",
        isWishlisted: true,
        courseId,
      });
    }

    const wishlistEntry = await Wishlist.create({
      userId: req.user._id,
      courseId,
    });

    return res.status(201).json({
      message: "Course added to wishlist",
      isWishlisted: true,
      courseId,
      wishlistId: wishlistEntry._id,
      course,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// @desc    Remove course from current user's wishlist
// @route   DELETE /wishlist/:courseId
// @access  Private
const removeFromWishlist = async (req, res) => {
  const { courseId } = req.params;

  try {
    await Wishlist.deleteOne({ userId: req.user._id, courseId });

    return res.json({
      message: "Course removed from wishlist",
      isWishlisted: false,
      courseId,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
