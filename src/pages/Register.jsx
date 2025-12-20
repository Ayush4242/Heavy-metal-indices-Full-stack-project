import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg(""); g
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    
    if (formData.password.length < 6) {
      setErrorMsg("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        "http://localhost:5000/api/auth/register",
        formData
      );

      alert("Registration successful");
      navigate("/login");
    } catch (error) {
      setErrorMsg(
        error.response?.data?.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pollution-bg flex items-center justify-center relative">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

      <div className="relative z-10 w-full max-w-5xl grid md:grid-cols-2 gap-10 items-center px-6">
        {/* LEFT SIDE */}
        <div className="text-white">
          <h1 className="text-4xl font-bold mb-4">
            Join the Fight Against
            <br />
            <span className="text-green-400">Environmental Pollution</span>
          </h1>

          <p className="text-lg text-gray-200 mb-6">
            Create your researcher account to analyze pollution data
            and environmental risks.
          </p>

          <blockquote className="italic text-sm text-gray-300 border-l-4 border-green-400 pl-4">
            “The future depends on what we do in the present.”
          </blockquote>
        </div>

        {/* RIGHT SIDE FORM */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-center mb-2">
            Researcher Registration
          </h2>

          <p className="text-center text-gray-600 mb-6">
            Create your pollution analytics account
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            />

            <input
              type="password"
              name="password"
              placeholder="Password (min 6 chars)"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
            />

            {errorMsg && (
              <p className="text-red-600 text-sm text-center">
                {errorMsg}
              </p>
            )}

            <button
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white p-3 rounded-lg font-semibold transition"
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-5">
            Already have an account?{" "}
            <NavLink
              to="/login"
              className="text-green-600 font-semibold hover:underline"
            >
              Login here
            </NavLink>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
