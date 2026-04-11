import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../lib/axios";

// Custom SVG Icons (Zero Dependencies)
const Icons = {
  User: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  ),
  Mail: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
  ),
  Lock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
  ),
  ArrowRight: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
  )
};

const SignupPage = () => {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const res = await axiosInstance.post("/auth/signup", formData);
      navigate("/verify-otp", {
        state: { userId: res.data.userId, email: formData.email },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center relative overflow-hidden bg-[#030303] px-4 select-none touch-none">
      
      {/* Dynamic Ambient Background */}
      <div className="absolute top-[-20%] right-[-10%] w-[80%] h-[70%] bg-purple-600/20 blur-[130px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-15%] left-[-10%] w-[60%] h-[60%] bg-primary/10 blur-[110px] rounded-full" />

      {/* The Signup Card */}
      <div className="relative w-full max-w-[440px] bg-white/[0.02] backdrop-blur-[50px] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] rounded-[3.5rem] p-10 md:p-12">
        
        {/* Branding */}
        <div className="text-center mb-10">
          <div className="">
            {/* <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping" /> */}
            {/* <span className="text-[9px] text-white/60 font-black uppercase tracking-[0.3em]">New Account</span> */}
          </div>
          
          <h1 className="text-7xl font-black text-white tracking-tighter leading-none mb-2">
            गफ<span className="text-primary text-6xl">.</span>
          </h1>
          <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.4em]">Join the network</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-bold uppercase tracking-wider text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Username Input */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-white uppercase tracking-[0.15em] ml-4">Username</label>
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-purple-500 transition-colors">
                <Icons.User />
              </div>
              <input
                type="text"
                placeholder="choose_a_name"
                className="w-full pl-14 pr-6 py-4 rounded-[1.8rem] bg-white/[0.03] border border-white/5 text-white placeholder-white/10 focus:outline-none focus:border-purple-500/40 focus:bg-white/[0.07] transition-all"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-white uppercase tracking-[0.15em] ml-4">Email Address</label>
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-purple-500 transition-colors">
                <Icons.Mail />
              </div>
              <input
                type="email"
                placeholder="you@email.com"
                className="w-full pl-14 pr-6 py-4 rounded-[1.8rem] bg-white/[0.03] border border-white/5 text-white placeholder-white/10 focus:outline-none focus:border-purple-500/40 focus:bg-white/[0.07] transition-all"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-white uppercase tracking-[0.15em] ml-4">Password</label>
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-purple-500 transition-colors">
                <Icons.Lock />
              </div>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full pl-14 pr-6 py-4 rounded-[1.8rem] bg-white/[0.03] border border-white/5 text-white placeholder-white/10 focus:outline-none focus:border-purple-500/40 focus:bg-white/[0.07] transition-all"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 group relative py-5 rounded-[1.8rem] bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black text-[11px] uppercase tracking-[0.25em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 overflow-hidden"
          >
             <div className="absolute inset-0 bg-white/10 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300" />
            {isLoading ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <>
                <span className="relative">Send OTP</span>
                <Icons.ArrowRight />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">
            Already a member?{" "}
            <Link to="/login" className="text-white hover:text-primary transition-colors ml-1 border-b border-white/20">
              Login to गफ
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;