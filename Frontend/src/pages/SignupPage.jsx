import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import axiosInstance from "../lib/axios";

const SignupPage = () => {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Password Validation: 8 chars, 1 letter, 1 number
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError("Password must be at least 8 characters and include 1 letter and 1 number");
      return;
    }

    setIsLoading(true);
    try {
      const res = await axiosInstance.post("/auth/signup", formData);
      navigate("/verify-otp", {
        state: {
          userId: res.data.userId,
          email: formData.email,
        }
      });
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a46b3] p-4 font-sans overflow-hidden">
      <div className="relative w-full max-w-[950px] min-h-[600px] bg-white rounded-[3.5rem] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-white/20">

        {/* LEFT SIDE: BRANDING */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-[#1e60ff] to-[#0a46b3] relative p-12 text-white flex-col justify-center items-center overflow-hidden">
          <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="relative z-10 text-center">
            <h1 className="text-7xl font-black tracking-tighter leading-none mb-4">
              गफ<span className="text-blue-300">.</span>
            </h1>
            <p className="text-blue-100/70 text-sm font-medium">
              Start your journey with Nepal's best <br /> chat app
            </p>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mt-12">
              BY AYUSH____
            </p>
          </div>
        </div>

        {/* RIGHT SIDE: FORM */}
        <div className="w-full md:w-1/2 p-8 md:p-14 bg-white flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-gray-950 mb-1 tracking-tight">Sign up</h2>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
              Join the Guff family
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase text-center leading-tight">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Username */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">
                Username
              </label>
              <div className="relative group">
                <User
                  className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#0a46b3]"
                  size={18}
                />
                <input
                  type="text"
                  required
                  placeholder="Enter your username "
                  className="w-full pl-14 pr-6 py-5 rounded-[1.8rem] bg-gray-50 border border-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all text-sm text-black"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">
                Email Address
              </label>
              <div className="relative group">
                <Mail
                  className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#0a46b3]"
                  size={18}
                />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full pl-14 pr-6 py-5 rounded-[1.8rem] bg-gray-50 border border-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all text-sm text-black"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">
                Password
              </label>
              <div className="relative group">
                <Lock
                  className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#0a46b3]"
                  size={18}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full pl-14 pr-16 py-5 rounded-[1.8rem] bg-gray-50 border border-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all text-sm text-black"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0a46b3] text-white py-5 rounded-[1.8rem] font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Join Community</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Already have an account?{" "}
            <Link to="/login" className="text-[#0a46b3] ml-1 uppercase font-black hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;