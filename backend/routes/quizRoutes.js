import express from "express";
import protect from "../middleware/authMiddleware.js";
import QuizResult from "../models/QuizResult.js"; 

const router = express.Router();


const quizQuestions = [
  {
    id: 1,
    question: "What does PLI stand for?",
    options: ["Pollution Level Index", "Pollution Load Index", "Public Land Indicator"],
    correct: "Pollution Load Index"
  },
  {
    id: 2,
    question: "Which metal is toxic from batteries?",
    options: ["Iron", "Lead", "Copper"],
    correct: "Lead"
  },
  {
    id: 3,
    question: "PLI < 1 means:",
    options: ["Safe", "Danger", "Critical"],
    correct: "Safe"
  },
  {
    id: 4,
    question: "Most polluted Indian city?",
    options: ["Mumbai", "Delhi", "Chennai"],
    correct: "Delhi"
  },
  {
    id: 5,
    question: "CF stands for:",
    options: ["Contamination Factor", "Clean Factor", "Chemical Formula"],
    correct: "Contamination Factor"
  }
];


router.get("/questions", protect, (req, res) => {
  res.json(quizQuestions);
});


router.post("/submit", protect, async (req, res) => {
  try {
    const { answers } = req.body;
    
    if (!answers || !Array.isArray(answers) || answers.length !== quizQuestions.length) {
      return res.status(400).json({ message: "Invalid answers format" });
    }
    
   
    let score = 0;
    const correctAnswers = quizQuestions.map(q => q.correct);
    
    quizQuestions.forEach((q, i) => {
      if (q.correct === answers[i]) score++;
    });
    
    const total = quizQuestions.length;
    const percentage = (score / total) * 100;
    const certificateEligible = percentage >= 70;
    
    
    const quizResult = new QuizResult({
      user: req.user._id,           
      userName: req.user.name,      
      userEmail: req.user.email,    
      score,
      total,
      percentage,
      answers,                      
      correctAnswers,               
      certificateEligible
    });
    
    await quizResult.save();
    
    console.log(`✅ Quiz result saved for ${req.user.name}: ${score}/${total} (${percentage}%)`);
    
    res.json({
      message: "Quiz submitted successfully!",
      result: {
        id: quizResult._id,
        userName: req.user.name,
        score,
        total,
        percentage: percentage.toFixed(2),
        certificateEligible,
        date: quizResult.createdAt
      }
    });
    
  } catch (error) {
    console.error("Error saving quiz result:", error);
    res.status(500).json({ 
      message: "Failed to save quiz result",
      error: error.message 
    });
  }
});

// GET user's quiz history
router.get("/my-results", protect, async (req, res) => {
  try {
    const results = await QuizResult.find({ user: req.user._id })
      .sort({ createdAt: -1 }) // Newest first
      .select("score total percentage certificateEligible createdAt");
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch quiz results" });
  }
});

// GET leaderboard (top 10 scores)
router.get("/leaderboard", protect, async (req, res) => {
  try {
    const leaderboard = await QuizResult.aggregate([
      {
        $group: {
          _id: "$user",
          userName: { $first: "$userName" },
          bestScore: { $max: "$percentage" },
          totalQuizzes: { $sum: 1 },
          lastAttempt: { $max: "$createdAt" }
        }
      },
      { $sort: { bestScore: -1 } },
      { $limit: 10 }
    ]);
    
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
});

export default router;