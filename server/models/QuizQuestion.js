import mongoose from "mongoose";

const quizQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    options: {
      type: [String], 
      required: true,
    },
    correctAnswer: {
      type: String, 
      required: true,
    },
    category: {
      type: String,
      default: "general",
    },
  },
  { timestamps: true }
);

const QuizQuestion = mongoose.model("QuizQuestion", quizQuestionSchema);
export default QuizQuestion;
