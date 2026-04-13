import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";
import axiosInstance from "../lib/axios";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      const res = await axiosInstance.post("/auth/signup", formData);

      const { userId, email, otp } = res.data;

      if (!userId) {
        setError("Signup failed");
        return;
      }

      // store OTP for popup
      sessionStorage.setItem("otp_code", otp);

      navigate("/verify-otp", {
        state: { userId, email }
      });

    } catch (err) {
      setError(err.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 to-blue-900 px-4">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-8">

        <h1 className="text-2xl font-bold text-center mb-6 text-blue-700">
          Create Account
        </h1>

        {error && (
          <div className="mb-4 bg-red-100 text-red-700 p-2 rounded text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Username */}
          <div>
            <label className="text-sm font-semibold">Username</label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="w-full border rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-black"
                placeholder="Enter username"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-semibold">Email</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full border rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-black"
                placeholder="Enter email"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-semibold">Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />

              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full border rounded-lg pl-10 pr-10 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-black"
                placeholder="Enter password"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Join Community"}
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;