import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Awareness from "./pages/Awareness";
import QuizResults from "./pages/QuizResults";

function App() {
  return (
    <Routes>
      
      <Route path="/" element={<Awareness />} />

      
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/quiz-results" element={<QuizResults />} />
    </Routes>
  );
}

export default App;
