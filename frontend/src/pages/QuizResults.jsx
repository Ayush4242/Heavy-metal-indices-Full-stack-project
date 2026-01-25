import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const QuizResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  const [quizResult, setQuizResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const normalizeResult = (result) => {
    if (!result) return null;
    const percentage = Number(result.percentage);
    const total = Number(result.total) || 0;
    const score = Number(result.score) || 0;

    return {
      score,
      total,
      wrong: result.wrong ?? Math.max(total - score, 0),
      percentage: Number.isFinite(percentage) ? percentage : 0,
      certificateEligible: Boolean(result.certificateEligible),
      date: result.date
        ? result.date
        : result.createdAt
          ? new Date(result.createdAt).toLocaleDateString()
          : new Date().toLocaleDateString()
    };
  };

  useEffect(() => {
    const loadResult = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      const stateResult = location.state?.quizResult;
      if (stateResult) {
        setQuizResult(normalizeResult(stateResult));
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(
  import.meta.env.VITE_API_URL + "/api/quiz/my-results", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data && res.data.length > 0) {
          setQuizResult(normalizeResult(res.data[0]));
        } else {
          setError("No quiz results found. Please take a quiz first.");
        }
      } catch (err) {
        setError("Could not load your latest quiz result.");
      } finally {
        setLoading(false);
      }
    };

    loadResult();
  }, [location.state, navigate, token]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 to-gray-800 py-8 px-4">
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1 style={{ fontSize: "2.25rem", fontWeight: "bold", color: "#1f2937", marginBottom: "0.5rem" }}>
            Quiz Results
          </h1>
          <p style={{ fontSize: "1.125rem", color: "#059669" }}>
            Pollution Awareness Assessment
          </p>
        </div>

        {/* Main Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem", gridAutoFlow: "row" }}>

          {loading && (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "2rem" }}>
              <p style={{ color: "#6b7280" }}>Loading your latest quiz result...</p>
            </div>
          )}

          {!loading && error && (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "2rem", backgroundColor: "#fef2f2", borderRadius: "1rem", border: "1px solid #fecdd3", color: "#b91c1c" }}>
              {error}
            </div>
          )}

          {!loading && !error && quizResult && (
            <>
          {/* Left Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            
            {/* Score Card */}
            <div style={{
              background: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)",
              borderRadius: "1.5rem",
              padding: "2rem",
              color: "white",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <div>
                  <p style={{ fontSize: "3.75rem", fontWeight: "bold", margin: "0" }}>
                    {quizResult.percentage?.toFixed(0)}%
                  </p>
                  <p style={{ fontSize: "1.125rem", margin: "0.5rem 0 0 0", opacity: 0.9 }}>
                    Score Percentage
                  </p>
                </div>
                <div style={{ fontSize: "4.5rem" }}>⭐</div>
              </div>

              <div style={{
                width: "100%",
                backgroundColor: "rgba(255,255,255,0.3)",
                borderRadius: "9999px",
                height: "12px",
                marginBottom: "1rem",
                overflow: "hidden"
              }}>
                <div style={{
                  backgroundColor: "white",
                  height: "100%",
                  borderRadius: "9999px",
                  width: `${quizResult.percentage}%`,
                  transition: "width 1s ease"
                }}></div>
              </div>

              <p style={{ margin: 0, opacity: 0.9 }}>Performance Indicator</p>
            </div>

            {/* Metrics */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
              {/* Correct */}
              <div style={{
                backgroundColor: "white",
                borderRadius: "1rem",
                padding: "1.5rem",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                textAlign: "center"
              }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>✓</div>
                <p style={{ color: "#6b7280", fontSize: "0.875rem", margin: "0 0 0.5rem 0" }}>
                  Correct Answers
                </p>
                <p style={{ fontSize: "2.25rem", fontWeight: "bold", color: "#16a34a", margin: 0 }}>
                  {quizResult.score}
                </p>
              </div>

              {/* Wrong */}
              <div style={{
                backgroundColor: "white",
                borderRadius: "1rem",
                padding: "1.5rem",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                textAlign: "center"
              }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>✕</div>
                <p style={{ color: "#6b7280", fontSize: "0.875rem", margin: "0 0 0.5rem 0" }}>
                  Wrong Answers
                </p>
                <p style={{ fontSize: "2.25rem", fontWeight: "bold", color: "#dc2626", margin: 0 }}>
                  {quizResult.wrong}
                </p>
              </div>

              {/* Total */}
              <div style={{
                backgroundColor: "white",
                borderRadius: "1rem",
                padding: "1.5rem",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                textAlign: "center"
              }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📋</div>
                <p style={{ color: "#6b7280", fontSize: "0.875rem", margin: "0 0 0.5rem 0" }}>
                  Total
                </p>
                <p style={{ fontSize: "2.25rem", fontWeight: "bold", color: "#2563eb", margin: 0 }}>
                  {quizResult.total}
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <button
                onClick={() => navigate("/dashboard")}
                style={{
                  background: "linear-gradient(135deg, #16a34a 0%, #059669 100%)",
                  color: "white",
                  fontWeight: "bold",
                  padding: "1rem",
                  borderRadius: "0.75rem",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1rem",
                  transition: "transform 0.2s"
                }}
              >
                📊 Dashboard
              </button>
              
                
              
            </div>
          </div>

          {/* Right Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Performance Card */}
            <div style={{
              backgroundColor: "white",
              borderRadius: "1rem",
              padding: "1.5rem",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
            }}>
              <h3 style={{ fontSize: "1.125rem", fontWeight: "bold", color: "#1f2937", margin: "0 0 1rem 0" }}>
                Performance
              </h3>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "0.875rem", color: "#374151", fontWeight: "500", margin: 0 }}>
                    {quizResult.percentage >= 80 ? "Excellent" : quizResult.percentage >= 60 ? "Good" : "Fair"}
                  </span>
                  <span style={{
                    fontSize: "0.75rem",
                    fontWeight: "bold",
                    backgroundColor: "#dbeafe",
                    color: "#1e40af",
                    padding: "0.25rem 0.75rem",
                    borderRadius: "9999px"
                  }}>
                    {quizResult.percentage?.toFixed(0)}%
                  </span>
                </div>
                <div style={{
                  width: "100%",
                  backgroundColor: "#e5e7eb",
                  borderRadius: "9999px",
                  height: "8px",
                  overflow: "hidden"
                }}>
                  <div style={{
                    backgroundColor: "#2563eb",
                    height: "100%",
                    width: `${quizResult.percentage}%`,
                    borderRadius: "9999px",
                    transition: "width 1s ease"
                  }}></div>
                </div>
              </div>

              <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #e5e7eb" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.875rem" }}>
                  <span style={{ color: "#4b5563" }}>Accuracy</span>
                  <span style={{ fontWeight: "bold", color: "#1f2937" }}>
                    {quizResult.percentage?.toFixed(1)}%
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                  <span style={{ color: "#4b5563" }}>Date</span>
                  <span style={{ fontWeight: "bold", color: "#1f2937" }}>
                    {quizResult.date}
                  </span>
                </div>
              </div>
            </div>

            {/* Tips Card */}
            <div style={{
              backgroundColor: "white",
              borderRadius: "1rem",
              padding: "1.5rem",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
            }}>
              <h3 style={{ fontSize: "1.125rem", fontWeight: "bold", color: "#1f2937", margin: "0 0 1rem 0" }}>
                💡 Tips
              </h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "0.875rem", color: "#374151" }}>
                <li style={{ marginBottom: "0.75rem" }}>• Review incorrect answers</li>
                <li style={{ marginBottom: "0.75rem" }}>• Read awareness materials</li>
                <li style={{ marginBottom: "0.75rem" }}>• Practice more quizzes</li>
                <li>• Keep improving!</li>
              </ul>
            </div>
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizResults;
