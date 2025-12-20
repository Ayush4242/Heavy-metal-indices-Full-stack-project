import QuizQuestion from "../models/QuizQuestion.js";
import QuizResult from "../models/QuizResult.js";

/* ========== GET QUIZ QUESTIONS ==========
   GET /api/quiz/questions
   Protected
========================================= */
export const getQuizQuestions = async (req, res) => {
  try {
    const questions = await QuizQuestion.find().limit(20);
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: "Failed to load quiz questions" });
  }
};


export const submitQuiz = async (req, res) => {
  const { answers } = req.body;

  try {
    const questions = await QuizQuestion.find().limit(20);

    if (!answers || !Array.isArray(answers) || answers.length !== questions.length) {
      return res.status(400).json({ message: "Invalid answers format" });
    }

    let score = 0;

    questions.forEach((q, index) => {
      if (q.correctAnswer === answers[index]) {
        score++;
      }
    });

    const total = questions.length;
    const percentage = (score / total) * 100;
    const certificateEligible = percentage >= 70;

    const result = await QuizResult.create({
      user: req.user.id,
      score,
      total,
      percentage,
      certificateEligible,
    });

    res.json({
      message: "Quiz submitted successfully",
      result,
    });
  } catch (error) {
    res.status(500).json({ message: "Quiz submission failed" });
  }
};


export const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await QuizResult.find()
      .populate("user", "name email")
      .sort({ score: -1 })
      .limit(10);

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: "Failed to load leaderboard" });
  }
};
