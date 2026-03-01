const Progress = require("../models/Progress");
const Course = require("../models/Course");

// This is DEMO v0 implementation

// @desc    Get user progress for a specific course
// @route   GET /progress/:courseId
// @access  Private
const getProgress = async (req, res) => {
  try {
    const progress = await Progress.findOne({
      userId: req.user._id,
      courseId: req.params.courseId,
    });

    if (progress) {
      res.json(progress);
    } else {
      res.status(404).json({ message: "Progress not found for this course" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Mark module as complete
// @route   POST /progress/complete-module
// @access  Private
const completeModule = async (req, res) => {
  const { courseId, moduleId } = req.body;

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    let progress = await Progress.findOne({
      userId: req.user._id,
      courseId,
    });

    // Require enrollment first
    if (!progress) {
      return res
        .status(403)
        .json({ message: "Please enroll in the course first" });
    }

    // Add module if not already completed
    if (!progress.completedModules.includes(moduleId)) {
      progress.completedModules.push(moduleId);
    }

    // Calculate progress percentage
    const totalModules = course.modules.length;
    if (totalModules > 0) {
      progress.progressPercentage =
        (progress.completedModules.length / totalModules) * 100;
    }

    await progress.save();
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Enroll in a course
// @route   POST /progress/enroll
// @access  Private
const enrollCourse = async (req, res) => {
  const { courseId } = req.body;

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    let progress = await Progress.findOne({
      userId: req.user._id,
      courseId,
    });

    if (progress) {
      return res
        .status(400)
        .json({ message: "User already enrolled in this course" });
    }

    progress = new Progress({
      userId: req.user._id,
      courseId,
      completedModules: [],
      progressPercentage: 0,
    });

    await progress.save();
    res.status(201).json(progress);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getProgress,
  completeModule,
  enrollCourse,
};
