const Course = require("../models/Course");

// This is DEMO v0 implementation

// @desc    Get all courses
// @route   GET /courses
// @access  Private
const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({}).populate("createdBy", "email role");
    return res.json(courses);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get single course by ID
// @route   GET /courses/:id
// @access  Private
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate(
      "createdBy",
      "email role",
    );
    if (course) {
      return res.json(course);
    } else {
      res.status(404).json({ message: "Course not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getCourses,
  getCourseById,
};
