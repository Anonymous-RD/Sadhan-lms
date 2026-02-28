const Course = require("../models/Course");
const Progress = require("../models/Progress");

// This is DEMO v0 implementation

// @desc    Submit quiz answers and update score/certificate status
// @route   POST /quiz/submit
// @access  Private
const submitQuiz = async (req, res) => {
  const { courseId, answers } = req.body;

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    let correctCount = 0;
    const totalQuestions = course.quiz.length;

    if (totalQuestions === 0) {
      return res.status(400).json({ message: "Course has no quiz questions" });
    }

    // Checking answers against correctAnswer
    answers.forEach((submitAnswer) => {
      // Find question by sub-document _id (from the quiz array)
      const question = course.quiz.id(submitAnswer.questionId);
      if (question && question.correctAnswer === submitAnswer.answer) {
        correctCount++;
      }
    });

    const scorePercentage = (correctCount / totalQuestions) * 100;

    // Update progress
    let progress = await Progress.findOne({
      userId: req.user._id,
      courseId,
    });

    if (!progress) {
      progress = new Progress({
        userId: req.user._id,
        courseId,
      });
    }

    progress.quizScore = scorePercentage;
    if (scorePercentage >= 60) {
      progress.certificateGenerated = true;
    }

    await progress.save();

    res.json({
      score: scorePercentage,
      passed: scorePercentage >= 60,
      certificateGenerated: progress.certificateGenerated,
      message:
        scorePercentage >= 60
          ? "Quiz passed! Certificate generated."
          : "Quiz failed. Score must be >= 60%.",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { submitQuiz };
