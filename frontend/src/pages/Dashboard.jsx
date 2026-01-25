import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

 
  const [pollutionData, setPollutionData] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [locationPLI, setLocationPLI] = useState([]);
  const [activeModal, setActiveModal] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [quizLeaderboard, setQuizLeaderboard] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const [formData, setFormData] = useState({
    location: "",
    metal: "",
    concentration: "",
    permissibleLimit: "",
  });

  
  const [pollutionStatus, setPollutionStatus] = useState({
    overallStatus: "SAFE",
    color: "bg-green-500",
    icon: "✅",
    description: "No pollution data yet",
    averagePLI: 0,
    highCount: 0,
  });

  
  const calculatePollutionStatus = (data) => {
    if (!data || data.length === 0) {
      return {
        overallStatus: "NO DATA",
        color: "bg-gray-500",
        icon: "📊",
        description: "No pollution data available",
        averagePLI: 0,
        highCount: 0,
      };
    }

    const totalPLI = data.reduce((sum, item) => sum + (item.pli || 0), 0);
    const averagePLI = totalPLI / data.length;
    const highCount = data.filter(item => item.pli > 1).length;

    if (averagePLI < 0.5) {
      return {
        overallStatus: "EXCELLENT",
        color: "bg-emerald-500",
        icon: "🌟",
        description: "Very clean environment",
        averagePLI,
        highCount,
      };
    } else if (averagePLI < 1) {
      return {
        overallStatus: "SAFE",
        color: "bg-green-500",
        icon: "✅",
        description: "Within safe limits",
        averagePLI,
        highCount,
      };
    } else if (averagePLI < 2) {
      return {
        overallStatus: "MODERATE",
        color: "bg-yellow-500",
        icon: "⚠️",
        description: "Needs monitoring",
        averagePLI,
        highCount,
      };
    } else if (averagePLI < 3) {
      return {
        overallStatus: "HIGH",
        color: "bg-orange-500",
        icon: "🚨",
        description: "Immediate attention needed",
        averagePLI,
        highCount,
      };
    } else {
      return {
        overallStatus: "CRITICAL",
        color: "bg-red-600",
        icon: "🔥",
        description: "Severe pollution detected",
        averagePLI,
        highCount,
      };
    }
  };

  // Status Bar Component with attention list
  const StatusBar = () => {
    // Calculate locations that need attention (PLI > 1)
    const locationsNeedingAttention = [...new Set(pollutionData.map(item => item.location))]
      .map(location => {
        const locationData = pollutionData.filter(item => item.location === location);
        const avgPLI = locationData.reduce((sum, item) => sum + (item.pli || 0), 0) / locationData.length;
        const highCount = locationData.filter(item => item.pli > 1).length;
        return { location, avgPLI, highCount };
      })
      .filter(item => item.avgPLI > 1)
      .sort((a, b) => b.avgPLI - a.avgPLI);

    return (
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-1 rounded-full ${pollutionStatus.color} text-white font-bold flex items-center text-sm`}>
                <span className="mr-2">{pollutionStatus.icon}</span>
                {pollutionStatus.overallStatus}
              </div>
              <div className="text-white">
                <p className="text-sm font-medium">{pollutionStatus.description}</p>
              </div>
            </div>
            <div className="text-white text-sm">
              <span className="mr-4">Avg PLI: <span className="font-bold">{pollutionStatus.averagePLI.toFixed(3)}</span></span>
              <span>High PLI: <span className={`font-bold ${pollutionStatus.highCount > 0 ? 'text-red-300' : 'text-green-300'}`}>{pollutionStatus.highCount}</span></span>
            </div>
          </div>
          
          {/* Attention List - Only shows if there are locations needing attention */}
          {locationsNeedingAttention.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-700">
              <div className="flex items-center text-gray-300 text-xs mb-1">
                <span className="mr-2">📍</span>
                <span className="font-medium">Areas needing attention:</span>
                <span className="ml-2 text-red-300">{locationsNeedingAttention.length} location(s)</span>
              </div>
              <div className="flex overflow-x-auto space-x-3 pb-1 scrollbar-thin">
                {locationsNeedingAttention.map((item, index) => (
                  <div key={index} className="flex-shrink-0 bg-red-900/30 px-3 py-1 rounded-full text-xs text-white border border-red-700">
                    <span className="font-medium">{item.location}</span>
                    <span className="ml-2 text-red-300">PLI: {item.avgPLI.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  
  const PredictionsModal = () => (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setActiveModal(null)}>
      <div className="bg-white rounded-xl w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">🔮 Predictive Trend Forecasting</h2>
          <button className="text-2xl hover:text-red-600" onClick={() => setActiveModal(null)}>×</button>
        </div>
        <div className="p-6">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3 text-left">Metal</th>
                <th className="p-3 text-left">Next Predicted Value</th>
                <th className="p-3 text-left">Trend</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(predictions).map((metal) => {
                const value = predictions[metal];
                const trend = value > 1 ? "📈 Increasing" : "📉 Decreasing";
                return (
                  <tr key={metal} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-semibold">{metal}</td>
                    <td className="p-3 text-lg">{value ? value.toFixed(3) : "Not enough data"}</td>
                    <td className="p-3">
                      <span className={`px-3 py-1 rounded-full text-sm ${value > 1 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {trend}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const LocationComparisonModal = () => (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setActiveModal(null)}>
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">🌍 Location-wise Pollution Analysis</h2>
          <button className="text-2xl hover:text-red-600" onClick={() => setActiveModal(null)}>×</button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {locationPLI.map((item, index) => {
              const severity = getSeverity(item.hazardIndex);
              return (
                <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800">{item.location}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${severity.color} text-white`}>
                      {severity.label}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Metals Detected:</span>
                      <span className="font-semibold">{item.metals?.length || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Multi-Metal PLI:</span>
                      <span className="font-bold text-blue-600">{item.multiMetalPLI?.toFixed(3) || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Hazard Index:</span>
                      <span className="font-bold text-red-600">{item.hazardIndex?.toFixed(3) || 0}</span>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-gray-500">Metals: {item.metals?.join(", ") || "None"}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const AnalyticsModal = () => {
    const barChartData = {
      labels: pollutionData.map((i) => i.metal),
      datasets: [{
        label: "Contamination Factor (CF)",
        data: pollutionData.map((i) => i.cf),
        backgroundColor: "rgba(34,197,94,0.7)",
      }],
    };

    const lineChartData = {
      labels: pollutionData.map((_, idx) => `Sample ${idx + 1}`),
      datasets: [{
        label: "Concentration Trend",
        data: pollutionData.map((i) => i.concentration),
        borderWidth: 3,
        borderColor: "#2563eb",
        backgroundColor: "rgba(37,99,235,0.2)",
      }],
    };

    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setActiveModal(null)}>
        <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-800">📊 Advanced Analytics Dashboard</h2>
            <button className="text-2xl hover:text-red-600" onClick={() => setActiveModal(null)}>×</button>
          </div>
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-bold mb-4">Contamination Factor Analysis</h3>
                <div className="bg-white p-4 rounded-xl shadow"><Bar data={barChartData} options={{ responsive: true }} /></div>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-4">Concentration Trend Over Time</h3>
                <div className="bg-white p-4 rounded-xl shadow"><Line data={lineChartData} options={{ responsive: true }} /></div>
              </div>
            </div>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border">
                <div className="text-3xl mb-2">📈</div><div className="text-2xl font-bold">{pollutionData.length}</div>
                <div className="text-gray-600">Total Samples</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border">
                <div className="text-3xl mb-2">📊</div>
                <div className="text-2xl font-bold">{pollutionData.filter((d) => d.pli > 1).length}</div>
                <div className="text-gray-600">PLI {'>'} 1</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border">
                <div className="text-3xl mb-2">📍</div>
                <div className="text-2xl font-bold">{new Set(pollutionData.map((d) => d.location)).size}</div>
                <div className="text-gray-600">Unique Locations</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

 
  const QuizModal = () => {
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [quizAnswers, setQuizAnswers] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [loadingQuiz, setLoadingQuiz] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [submittedResult, setSubmittedResult] = useState(null);

    const loadQuizQuestions = async () => {
      try {
        setLoadingQuiz(true);
        const res = await axios.get(import.meta.env.VITE_API_URL + "/api/quiz/questions", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setQuizQuestions(res.data);
        setQuizAnswers(new Array(res.data.length).fill(""));
      } catch (err) {
        console.error("Could not load quiz");
        setQuizQuestions([
          { id: 1, question: "PLI stands for?", options: ["Pollution Level", "Pollution Load Index", "Public Land"], correct: "Pollution Load Index" },
          { id: 2, question: "Toxic battery metal?", options: ["Lead", "Iron", "Copper"], correct: "Lead" },
          { id: 3, question: "PLI < 1 means?", options: ["Safe", "Danger", "Critical"], correct: "Safe" },
          { id: 4, question: "Most polluted city?", options: ["Mumbai", "Delhi", "Chennai"], correct: "Delhi" },
          { id: 5, question: "CF stands for?", options: ["Contamination Factor", "Clean Factor", "Chemical Formula"], correct: "Contamination Factor" }
        ]);
        setQuizAnswers(new Array(5).fill(""));
      } finally {
        setLoadingQuiz(false);
      }
    };

    const handleQuizSubmit = async () => {
      try {
        setLoadingQuiz(true);
        const res = await axios.post(
  import.meta.env.VITE_API_URL + "/api/quiz/submit",
          { answers: quizAnswers },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const result = res.data.result;
        const percentage = Number(result.percentage);
        const date = result.date || result.createdAt;
        const formattedResult = {
          score: result.score,
          total: result.total,
          wrong: result.total - result.score,
          percentage: Number.isFinite(percentage) ? percentage : 0,
          certificateEligible: result.certificateEligible,
          date: date ? new Date(date).toLocaleDateString() : new Date().toLocaleDateString()
        };
        setSubmittedResult(formattedResult);
        setShowResult(true);
        setQuizResult(formattedResult); 
        fetchQuizLeaderboard();
        
        
        setTimeout(() => {
          setShowQuiz(false);
          navigate("/quiz-results", { state: { quizResult: formattedResult } });
        }, 1500);
      } catch (err) {
        console.error("Submit failed, calculating locally");
        let score = 0;
        quizQuestions.forEach((q, i) => {
          if (q.correct === quizAnswers[i]) score++;
        });
        const result = {
          score,
          total: quizQuestions.length,
          wrong: quizQuestions.length - score,
          percentage: (score / quizQuestions.length) * 100,
          certificateEligible: (score / quizQuestions.length) * 100 >= 70,
          date: new Date().toLocaleDateString()
        };
        setSubmittedResult(result);
        setShowResult(true);
        setQuizResult(result); 
        fetchQuizLeaderboard();
        
        
        setTimeout(() => {
          setShowQuiz(false);
          navigate("/quiz-results", { state: { quizResult: result } });
        }, 1500);
      } finally {
        setLoadingQuiz(false);
      }
    };

    const resetQuiz = () => {
      setCurrentQuestion(0);
      setQuizAnswers(new Array(quizQuestions.length).fill(""));
      setShowResult(false);
      setSubmittedResult(null);
    };

    useEffect(() => {
      if (showQuiz && quizQuestions.length === 0) {
        loadQuizQuestions();
      }
    }, [showQuiz]);

    if (!showQuiz) return null;

    const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;

    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Pollution Quiz</h2>
              <button onClick={() => { 
                setShowQuiz(false); 
                setQuizResult(null); 
                resetQuiz();
              }} className="text-white hover:text-gray-200 text-2xl">×</button>
            </div>
            
            {!showResult && quizQuestions.length > 0 && (
              <>
                <div className="w-full bg-white/30 rounded-full h-2">
                  <div className="bg-white h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="flex justify-between mt-2 text-sm">
                  <span>Question {currentQuestion + 1} of {quizQuestions.length}</span>
                  <span>{Math.round(progress)}% Complete</span>
                </div>
              </>
            )}
          </div>

          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {showResult && submittedResult ? (
              <div className="text-center py-8">
                <div className={`text-5xl mb-4 ${submittedResult.percentage >= 70 ? 'text-green-500' : 'text-yellow-500'}`}>
                  {submittedResult.percentage >= 70 ? '🎉' : '📝'}
                </div>
                <h3 className="text-2xl font-bold mb-2">Quiz Completed!</h3>
                <p className="text-lg mb-2">Score: <span className="font-bold">{submittedResult.score}/{submittedResult.total}</span></p>
                <p className="text-lg mb-2">Percentage: <span className="font-bold">{submittedResult.percentage?.toFixed(1) || 0}%</span></p>
                {submittedResult.certificateEligible && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-700 font-semibold">🏆 Congratulations! You're eligible for a certificate!</p>
                    <p className="text-green-600 text-sm mt-1">Result saved to your profile</p>
                  </div>
                )}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg animate-pulse">
                  <p className="text-blue-700 font-semibold">⏳ Redirecting to your detailed results...</p>
                </div>
              </div>
            ) : loadingQuiz ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
                <p className="mt-4 text-gray-600">Loading...</p>
              </div>
            ) : quizQuestions.length > 0 ? (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">{quizQuestions[currentQuestion]?.question}</h3>
                <div className="space-y-3">
                  {quizQuestions[currentQuestion]?.options.map((option, index) => (
                    <button key={index} onClick={() => { 
                      const newAnswers = [...quizAnswers]; 
                      newAnswers[currentQuestion] = option; 
                      setQuizAnswers(newAnswers); 
                    }} className={`w-full text-left p-4 rounded-lg border transition-all ${
                      quizAnswers[currentQuestion] === option 
                        ? 'border-green-500 bg-green-50 text-green-800' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}>
                      {option}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-8 pt-6 border-t">
                  <button onClick={() => setCurrentQuestion(currentQuestion - 1)} disabled={currentQuestion === 0} className={`px-6 py-2 rounded-lg font-medium ${
                    currentQuestion === 0 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}>
                    ← Previous
                  </button>
                  {currentQuestion === quizQuestions.length - 1 ? (
                    <button onClick={handleQuizSubmit} disabled={loadingQuiz || quizAnswers.some(a => !a)} className={`px-8 py-3 rounded-lg font-semibold ${
                      quizAnswers.some(a => !a) || loadingQuiz 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}>
                      {loadingQuiz ? 'Submitting...' : 'Submit Quiz'}
                    </button>
                  ) : (
                    <button onClick={() => setCurrentQuestion(currentQuestion + 1)} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                      Next →
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">No quiz questions available.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const LeaderboardModal = () => {
    if (!showLeaderboard) return null;

    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Quiz Leaderboard</h2>
              <button onClick={() => setShowLeaderboard(false)} className="text-white hover:text-gray-200 text-2xl">×</button>
            </div>
            <p className="opacity-90">Top performers in pollution knowledge</p>
          </div>

          <div className="p-6 overflow-y-auto max-h-[70vh]">
            {quizLeaderboard.length > 0 ? (
              <div className="space-y-4">
                {quizLeaderboard.map((user, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${
                    index < 3 
                      ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 
                          index === 2 ? 'bg-amber-700' : 'bg-gray-300'
                        } text-white font-bold`}>
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800">{user.userName || "Anonymous"}</h3>
                          <p className="text-sm text-gray-500">{user.totalQuizzes || 0} quiz{user.totalQuizzes !== 1 ? 'es' : ''}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-800">{user.bestScore?.toFixed(1) || 0}%</div>
                        <div className="text-sm text-gray-500">Best Score</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">No leaderboard data yet.</p>
                <p className="text-gray-500 text-sm mt-2">Be the first to take the quiz!</p>
              </div>
            )}

            {quizResult && (
              <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-bold text-green-800 mb-2">Your Latest Result</h3>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-green-700">Score: {quizResult.score}/{quizResult.total}</p>
                    <p className="text-green-700">Percentage: {quizResult.percentage?.toFixed(1)}%</p>
                    <p className="text-green-600 text-sm">Date: {quizResult.date}</p>
                  </div>
                  {quizResult.certificateEligible && (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                      🏆 Certificate Eligible
                    </span>
                  )}
                </div>
                <button 
                  onClick={() => setShowQuiz(true)}
                  className="mt-3 text-green-600 hover:text-green-800 text-sm font-medium"
                >
                  ↗ Retake Quiz
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const getSeverity = (v) => {
    if (!v || v < 1) return { label: "Low", color: "bg-green-500" };
    if (v < 3) return { label: "Moderate", color: "bg-yellow-400" };
    return { label: "High", color: "bg-red-500" };
  };

  // YOUR ORIGINAL fetch functions - UPDATED to calculate status
  const fetchPollutionData = async () => {
    try {
      const res = await axios.get(
  import.meta.env.VITE_API_URL + "/api/pollution/my" ,{
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.records || [];
      setPollutionData(data);
      setPredictions(res.data.predictions || {});
      
      // NEW: Calculate and set pollution status
      const status = calculatePollutionStatus(data);
      setPollutionStatus(status);
    } catch (error) {
      console.error("Fetch failed", error);
    }
  };

  const fetchLocationPLI = async () => {
    try {
      const res = await axios.get(
  import.meta.env.VITE_API_URL + "/api/quiz/leaderboard", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLocationPLI(res.data || []);
    } catch (error) {
      console.error("Location PLI fetch failed", error);
    }
  };

  const fetchQuizLeaderboard = async () => {
    try {
      await axios.post(
  import.meta.env.VITE_API_URL + "/api/pollution/add", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuizLeaderboard(res.data || []);
    } catch (error) {
      console.error("Failed to fetch leaderboard");
    }
  };

  // YOUR ORIGINAL useEffect
  useEffect(() => {
    if (!token) {
      navigate("/");
    } else {
      fetchPollutionData();
      fetchLocationPLI();
      fetchQuizLeaderboard();
    }
  }, [navigate, token]);

  // YOUR ORIGINAL handleChange
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // YOUR ORIGINAL handleSubmit - UPDATED to refresh status
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/pollution/add", formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("✅ Pollution data saved successfully");
      setFormData({ location: "", metal: "", concentration: "", permissibleLimit: "" });
      fetchPollutionData();
      fetchLocationPLI();
    } catch (error) {
      alert("❌ Failed to save data");
    }
  };

  // YOUR ORIGINAL downloadCSV
  const downloadCSV = () => {
    if (pollutionData.length === 0) {
      alert("No data to export");
      return;
    }
    const headers = ["Location", "Metal", "Concentration", "Permissible Limit", "CF", "I-Geo", "PLI", "Date"];
    const rows = pollutionData.map((item) => [
      item.location,
      item.metal,
      item.concentration,
      item.permissibleLimit,
      item.cf?.toFixed(3) || "0",
      item.iGeo?.toFixed(3) || "0",
      item.pli?.toFixed(3) || "0",
      item.createdAt ? new Date(item.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map((r) => r.join(",")).join("\n");
    const encoded = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encoded;
    link.download = "pollution_data.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // YOUR ORIGINAL handleLogout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // YOUR ORIGINAL return statement - ONLY ADDED StatusBar at the top
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 to-gray-800">
      {/* NEW: Status Bar with attention list */}
      <StatusBar />
      
      {/* YOUR EXACT ORIGINAL MODALS */}
      {activeModal === 'predictions' && <PredictionsModal />}
      {activeModal === 'location' && <LocationComparisonModal />}
      {activeModal === 'analytics' && <AnalyticsModal />}
      <QuizModal />
      <LeaderboardModal />
      
      {/* YOUR EXACT ORIGINAL MAIN CONTENT */}
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Environmental Pollution Analysis</h1>
            <p className="text-gray-300">Monitor, analyze, and predict pollution levels</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setShowLeaderboard(true)} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg flex items-center gap-2">
              <span>🏆</span> Leaderboard
            </button>
            <button onClick={() => setShowQuiz(true)} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg flex items-center gap-2">
              <span>🧠</span> Take Quiz
            </button>
            <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg">Logout</button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { icon: "🔮", title: "Predictive Trends", desc: "View forecasted pollution levels", modal: "predictions", color: "from-blue-600 to-blue-700" },
            { icon: "🌍", title: "Location Analysis", desc: "Compare pollution across locations", modal: "location", color: "from-green-600 to-green-700" },
            { icon: "📊", title: "Advanced Analytics", desc: "Detailed charts and statistics", modal: "analytics", color: "from-purple-600 to-purple-700" },
          ].map((card) => (
            <div key={card.modal} className={`bg-gradient-to-r ${card.color} rounded-xl p-6 text-white cursor-pointer hover:scale-105 transition-transform shadow-lg flex items-center justify-between`} onClick={() => setActiveModal(card.modal)}>
              <div className="flex items-center gap-4">
                <div className="text-3xl">{card.icon}</div>
                <div>
                  <h3 className="font-bold text-lg">{card.title}</h3>
                  <p className="text-sm opacity-90">{card.desc}</p>
                </div>
              </div>
              <div className="text-2xl">→</div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Add Record Form */}
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="mr-3">📥</span> Add New Pollution Record
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" name="location" placeholder="Location" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200" value={formData.location} onChange={handleChange} required />
                  <input type="text" name="metal" placeholder="Metal Type" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200" value={formData.metal} onChange={handleChange} required />
                  <input type="number" name="concentration" placeholder="Concentration" step="0.001" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200" value={formData.concentration} onChange={handleChange} required />
                  <input type="number" name="permissibleLimit" placeholder="Permissible Limit" step="0.001" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200" value={formData.permissibleLimit} onChange={handleChange} required />
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all">
                  Submit Record
                </button>
              </form>
            </div>

            {/* Data Export */}
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="mr-3">📤</span> Data Export
              </h2>
              <button onClick={downloadCSV} className="w-full bg-gradient-to-r from-gray-800 to-gray-900 text-white py-4 rounded-lg font-semibold hover:from-gray-900 hover:to-black transition-all flex items-center justify-center">
                <span className="mr-3">⬇</span> Export All Data as CSV
              </button>
              <p className="text-gray-500 text-sm mt-3 text-center">
                {pollutionData.length} records available for export
              </p>
            </div>
          </div>

          {/* Right Column */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <span className="mr-3">📘</span> Pollution Records
              </h2>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                {pollutionData.length} entries
              </span>
            </div>
            
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 sticky top-0">
                    <th className="p-3 text-left text-gray-600 font-semibold border-b">Location</th>
                    <th className="p-3 text-left text-gray-600 font-semibold border-b">Metal</th>
                    <th className="p-3 text-left text-gray-600 font-semibold border-b">Conc.</th>
                    <th className="p-3 text-left text-gray-600 font-semibold border-b">CF</th>
                    <th className="p-3 text-left text-gray-600 font-semibold border-b">PLI</th>
                  </tr>
                </thead>
                <tbody>
                  {pollutionData.map((item) => (
                    <tr key={item._id || item.id} className="border-b hover:bg-gray-50">
                      <td className="p-3"><div className="font-medium">{item.location}</div></td>
                      <td className="p-3"><span className="bg-gray-100 px-3 py-1 rounded-full text-sm">{item.metal}</span></td>
                      <td className="p-3 font-semibold">{item.concentration}</td>
                      <td className="p-3 font-medium">
                        <span className={item.cf > 1 ? "text-red-600" : "text-green-600"}>
                          {item.cf?.toFixed(2) || "0.00"}
                        </span>
                      </td>
                      <td className="p-3 font-bold">
                        <span className={item.pli > 1 ? "text-red-600" : "text-green-600"}>
                          {item.pli?.toFixed(2) || "0.00"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* CF Statistics */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { color: "text-blue-600", count: pollutionData.filter(d => d.cf <= 1).length, label: "CF ≤ 1" },
                { color: "text-yellow-600", count: pollutionData.filter(d => d.cf > 1 && d.cf <= 2).length, label: "CF 1-2" },
                { color: "text-red-600", count: pollutionData.filter(d => d.cf > 2).length, label: "CF > 2" },
              ].map((stat, i) => (
                <div key={i} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.count}</div>
                  <div className="text-gray-600 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Latest Quiz Result Display */}
            {quizResult && (
              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-gray-800 flex items-center">
                    <span className="mr-2">📝</span> Latest Quiz Result
                  </h3>
                  {quizResult.certificateEligible && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                      🏆 Certificate
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-800">{quizResult.score}/{quizResult.total}</div>
                    <div className="text-gray-600 text-sm">Score</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-xl font-bold ${quizResult.percentage >= 70 ? 'text-green-600' : quizResult.percentage >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {quizResult.percentage?.toFixed(1)}%
                    </div>
                    <div className="text-gray-600 text-sm">Percentage</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-800">{quizResult.date}</div>
                    <div className="text-gray-600 text-sm">Date</div>
                  </div>
                </div>
                <div className="flex justify-center gap-2 mt-3">
                  <button onClick={() => setShowQuiz(true)} className="text-green-600 hover:text-green-800 text-sm font-medium">
                    ↗ Retake Quiz
                  </button>
                  <span className="text-gray-400">•</span>
                  <button onClick={() => setShowLeaderboard(true)} className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                    ↗ View Leaderboard
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-400 text-sm">
          <p>Data updated in real-time • Last refresh: {new Date().toLocaleTimeString()}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;