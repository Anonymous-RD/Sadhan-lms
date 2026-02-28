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

    // Create progress record if it doesn't exist
    if (!progress) {
      progress = new Progress({
        userId: req.user._id,
        courseId,
        completedModules: [],
      });
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

module.exports = {
  getProgress,
  completeModule,
};
