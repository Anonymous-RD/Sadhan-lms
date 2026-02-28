const mongoose = require("mongoose");

// This is DEMO v0 implementation

const progressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    completedModules: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course.modules", // Conceptual ref
      },
    ],
    progressPercentage: {
      type: Number,
      default: 0,
    },
    quizScore: {
      type: Number,
      default: 0,
    },
    certificateGenerated: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Prevent multiple progress records for the same user and course
progressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

const Progress = mongoose.model("Progress", progressSchema);
module.exports = Progress;
