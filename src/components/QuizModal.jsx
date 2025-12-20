import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const QuizModal = ({ show, onClose, token, onResult }) => {
  const navigate = useNavigate();
  // Hardcoded questions - no API calls
  const questions = [
    { 
      id: 1, 
      question: "PLI stands for?", 
      options: ["Pollution Level", "Pollution Load Index", "Public Land"], 
      correct: "Pollution Load Index" 
    },
    { 
      id: 2, 
      question: "Which metal is highly toxic from batteries?", 
      options: ["Iron", "Lead", "Copper"], 
      correct: "Lead" 
    },
    { 
      id: 3, 
      question: "PLI < 1 means?", 
      options: ["Safe", "Danger", "Critical"], 
      correct: "Safe" 
    },
    { 
      id: 4, 
      question: "CF stands for?", 
      options: ["Contamination Factor", "Clean Factor", "Chemical Formula"], 
      correct: "Contamination Factor" 
    },
    { 
      id: 5, 
      question: "Which city is known for high air pollution in India?", 
      options: ["Mumbai", "Delhi", "Bangalore"], 
      correct: "Delhi" 
    }
  ];
  
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  // Reset when modal opens
  useEffect(() => {
    if (show) {
      setCurrent(0);
      setAnswers(Array(questions.length).fill(""));
      setShowResult(false);
      setQuizResult(null);
    }
  }, [show]);

  const handleSelect = (option) => {
    const updated = [...answers];
    updated[current] = option;
    setAnswers(updated);
  };

  const handleSubmit = () => {
    // Simple calculation
    let correct = 0;
    let wrong = 0;
    
    questions.forEach((q, i) => {
      if (q.correct === answers[i]) {
        correct++;
      } else {
        wrong++;
      }
    });
    
    const total = questions.length;
    const percentage = (correct / total) * 100;
    
    const result = {
      score: correct,
      total: total,
      wrong: wrong,
      percentage: percentage,
      certificateEligible: percentage >= 70,
      date: new Date().toLocaleDateString()
    };
    
    setQuizResult(result);
    setShowResult(true);
    
    // Send result back to Dashboard
    if (onResult) {
      onResult(result);
    }
  };

  const handleClose = () => {
    setCurrent(0);
    setAnswers(Array(questions.length).fill(""));
    setShowResult(false);
    setQuizResult(null);
    onClose();
  };

  if (!show) return null;

  const progress = ((current + 1) / questions.length) * 100;
  const isLastQuestion = current === questions.length - 1;
  const hasAnsweredCurrent = answers[current] && answers[current].trim() !== "";

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-xl rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Pollution Quiz</h2>
            <button 
              onClick={handleClose}
              className="text-white hover:text-gray-200 text-3xl"
            >
              ×
            </button>
          </div>
          
          {!showResult && (
            <>
              <div className="w-full bg-white/30 rounded-full h-2">
                <div className="bg-white h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
              </div>
              <div className="flex justify-between mt-2 text-sm">
                <span>Question {current + 1} of {questions.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
            </>
          )}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {showResult && quizResult ? (
            <div className="text-center py-4">
              <div className="text-5xl mb-6">📊</div>
              <h3 className="text-2xl font-bold mb-6">Quiz Results</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <div className="text-3xl font-bold text-green-600">{quizResult.score}</div>
                  <div className="text-green-700 font-medium">Correct</div>
                </div>
                <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                  <div className="text-3xl font-bold text-red-600">{quizResult.wrong}</div>
                  <div className="text-red-700 font-medium">Wrong</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <div className="text-3xl font-bold text-blue-600">{quizResult.total}</div>
                  <div className="text-blue-700 font-medium">Total</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                  <div className="text-3xl font-bold text-yellow-600">{quizResult.percentage.toFixed(0)}%</div>
                  <div className="text-yellow-700 font-medium">Score</div>
                </div>
              </div>
              
              {quizResult.certificateEligible && (
                <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-xl">
                  <p className="text-green-800 font-bold flex items-center justify-center">
                    <span className="mr-2">🏆</span> Certificate Eligible!
                  </p>
                </div>
              )}
              
              <div className="space-y-3">
                <button
                  onClick={() => {
                    navigate("/quiz-results", { state: { quizResult } });
                    handleClose();
                  }}
                  className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 text-lg"
                >
                  View Full Results
                </button>
                <button
                  onClick={handleClose}
                  className="w-full py-3 bg-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-400 text-lg"
                >
                  Close Quiz
                </button>
              </div>
            </div>
          ) : (
            <>
              <h3 className="text-xl font-bold text-gray-800 mb-6">
                Q{current + 1}: {questions[current].question}
              </h3>
              
              <div className="space-y-3 mb-8">
                {questions[current].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelect(option)}
                    className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                      answers[current] === option
                        ? "border-green-500 bg-green-50 text-green-800"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setCurrent(current - 1)}
                  disabled={current === 0}
                  className={`px-5 py-2 rounded-lg font-medium ${
                    current === 0 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  ← Back
                </button>
                
                {isLastQuestion ? (
                  <button
                    onClick={handleSubmit}
                    disabled={!hasAnsweredCurrent}
                    className={`px-8 py-3 rounded-lg font-bold ${
                      !hasAnsweredCurrent
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    Submit Quiz
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrent(current + 1)}
                    disabled={!hasAnsweredCurrent}
                    className={`px-8 py-3 rounded-lg font-bold ${
                      !hasAnsweredCurrent
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    Next →
                  </button>
                )}
              </div>
              
              <div className="mt-4 text-center text-sm text-gray-500">
                {answers.filter(a => a && a.trim() !== "").length} of {questions.length} questions answered
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizModal;