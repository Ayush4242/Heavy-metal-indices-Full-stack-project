import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      email: formData.email.trim(),
      password: formData.password.trim(),
    };

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        payload
      );

      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen pollution-bg flex items-center justify-center relative">
      
      {/* 🔥 FIX: overlay will NOT block clicks now */}
      <div className="absolute inset-0 smoke-animation backdrop-blur-sm pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-5xl grid md:grid-cols-2 gap-10 items-center px-6">
        
        {/* LEFT SECTION */}
        <div className="text-white">
          <h1 className="text-4xl font-bold mb-4">
            National Pollution Control
            <br />
            <span className="text-green-400">Data Monitoring System</span>
          </h1>

          <p className="text-lg text-gray-200 mb-6">
            Access your pollution analytics dashboard.
          </p>
        </div>

        {/* RIGHT SECTION */}
        <div className="bg-white/90 rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-center mb-2">
            Researcher Login
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address"
              required
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            />

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            />

            {errorMsg && (
              <p className="text-red-600 text-sm text-center">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 transition text-white p-3 rounded-lg font-semibold"
            >
              Login
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-5">
            Don’t have an account?{" "}
            <NavLink
              to="/register"
              className="text-green-600 font-semibold hover:underline"
            >
              Register here
            </NavLink>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
