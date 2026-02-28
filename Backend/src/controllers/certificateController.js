const Progress = require("../models/Progress");
const Course = require("../models/Course");

// This is DEMO v0 implementation

// @desc    Generate JSON certificate
// @route   GET /certificate/:courseId
// @access  Private
const generateCertificate = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const progress = await Progress.findOne({
      userId: req.user._id,
      courseId: req.params.courseId,
      certificateGenerated: true,
    });

    if (!progress) {
      return res
        .status(400)
        .json({ message: "Not eligible for certificate yet" });
    }

    // Generate certificate response
    const timestamp = Date.now();
    const certificateId = `CERT-${req.user._id.toString().substring(0, 8).toUpperCase()}-${course._id.toString().substring(0, 8).toUpperCase()}-${timestamp}`;

    res.json({
      userName: req.user.name || req.user.email,
      courseTitle: course.title,
      date: new Date().toISOString(),
      certificateId,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { generateCertificate };
