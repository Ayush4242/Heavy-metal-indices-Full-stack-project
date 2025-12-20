import mongoose from "mongoose";

const quizResultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    userEmail: {
      type: String,
      required: true
    },
    score: {
      type: Number,
      required: true
    },
    total: {
      type: Number,
      required: true
    },
    percentage: {
      type: Number,
      required: true
    },
    answers: {
      type: [String],  // Store what user answered
      required: true
    },
    correctAnswers: {
      type: [String],  // Store correct answers for reference
      required: true
    },
    certificateEligible: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const QuizResult = mongoose.model("QuizResult", quizResultSchema);
export default QuizResult;