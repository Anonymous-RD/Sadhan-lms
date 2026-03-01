const mongoose = require("mongoose");

// This is DEMO v0 implementation

const quizQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
});

const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  order: { type: Number, required: true },
});

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    youtubeVideoUrl: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      default: "English",
    },
    category: {
      type: String,
      required: true,
      default: "Development",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    modules: [moduleSchema],
    quiz: [quizQuestionSchema],
  },
  { timestamps: true },
);

const Course = mongoose.model("Course", courseSchema);
module.exports = Course;
