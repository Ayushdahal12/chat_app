import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isExiting, setIsExiting] = useState(false);

  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const res = await login(formData);
    if (res?.success) {
      setIsExiting(true);
      setTimeout(() => navigate("/"), 600);
    } else {
      setError(res?.message || "Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a46b3] p-4 overflow-hidden font-sans">
      <AnimatePresence>
        {!isExiting && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ x: "120vw", opacity: 0, transition: { duration: 0.7, ease: "easeIn" } }}
            className="relative w-full max-w-[900px] min-h-[600px] bg-white rounded-[3.5rem] shadow-[0_60px_120px_-15px_rgba(0,0,0,0.35)] flex flex-col md:flex-row-reverse overflow-hidden border border-white/20"
          >

            {/* RIGHT SIDE (BRANDING) */}
            <div className="hidden md:flex w-1/2 bg-gradient-to-br from-[#1e60ff] to-[#0a46b3] relative p-12 text-white flex-col justify-center items-center overflow-hidden">
              <div className="absolute -bottom-20 -right-20 w-[25rem] h-[25rem] bg-blue-400/20 rounded-full blur-[100px]" />
              <div className="absolute top-1/4 left-[-100px] w-64 h-64 bg-white/10 rounded-full blur-3xl" />

              <div className="relative z-10 text-center flex flex-col items-center">
                <h1 className="text-7xl md:text-8xl font-black tracking-tighter leading-none mb-6">
                  गफ<span className="text-blue-300">.</span>
                </h1>
                <p className="text-blue-100/70 text-sm font-medium leading-relaxed max-w-[200px] mb-8">
                  Welcome back. Nepal's best chatting app
                </p>
                <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.5em] mt-12">BY AYUSH____</p>
              </div>
            </div>

            {/* LEFT SIDE (FORM) */}
            <div className="w-full md:w-1/2 p-8 md:p-14 bg-white flex flex-col justify-center">
              <div className="mb-8">
                <h2 className="text-3xl font-black text-gray-950 mb-2 tracking-tight">Sign in</h2>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Connect to your account</p>
              </div>

              {error && (
                <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Email Address</label>
                  <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#0a46b3] transition-colors">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="name@email.com"
                      className="w-full pl-14 pr-6 py-5 rounded-[1.8rem] bg-gray-50 border border-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all text-sm"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Password</label>
                  <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#0a46b3] transition-colors">
                      <Lock size={18} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      className="w-full pl-14 pr-16 py-5 rounded-[1.8rem] bg-gray-50 border border-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all text-sm"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#0a46b3] uppercase tracking-wider"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  {/* ✅ Add this line below password field */}
                  <div className="text-right pr-2">
                    <Link
                      to="/forgot-password"
                      className="text-[9px] font-black text-[#0a46b3] uppercase tracking-widest hover:underline"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#0a46b3] text-white py-5 rounded-[1.8rem] font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Start Chatting</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-10 text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  New to Guff?{" "}
                  <Link to="/signup" className="text-[#0a46b3] hover:underline ml-1">Create Account</Link>
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoginPage;