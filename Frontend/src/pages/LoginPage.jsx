import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react"; 

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const res = await login(formData);
    if (res.success) navigate("/");
    else setError(res.message);
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center relative overflow-hidden bg-[#030303] px-4 select-none touch-none">
      
      {/* Cinematic Background Lighting */}
      <div className="absolute top-[-25%] left-[-15%] w-[90%] h-[80%] bg-primary/20 blur-[130px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[60%] h-[60%] bg-blue-500/10 blur-[110px] rounded-full" />

      {/* The Main Login Card */}
      <div className="relative w-full max-w-[420px] bg-white/[0.02] backdrop-blur-[50px] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] rounded-[3.5rem] p-10 md:p-12">
        
        {/* Nepali Branding Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
            <span className="text-[9px] text-white/60 font-black uppercase tracking-[0.3em]">CHAT & CALL</span>
          </div>
          
          {/* THE BIG LOGO */}
          <h1 className="text-7xl font-black text-white tracking-tighter leading-none mb-2">
            गफ<span className="text-primary text-6xl">.</span>
          </h1>
          <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.4em]">BY AYUSH____</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/5 border border-red-500/20 text-red-400 text-[11px] font-bold uppercase tracking-wider text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Email Input Group */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em] ml-4">Email Address</label>
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors">
                <Mail size={18} strokeWidth={2.5} />
              </div>
              <input
                type="email"
                placeholder="name@email.com"
                className="w-full pl-14 pr-6 py-4.5 rounded-[1.8rem] bg-white/[0.03] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-primary/40 focus:bg-white/[0.07] transition-all duration-300"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Password Input Group */}
          <div className="space-y-2">
            <div className="flex justify-between items-center px-4">
              <label className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em]">Password</label>
              <Link to="/forgot-password" hidden={isLoading} className="text-[9px] font-black text-primary hover:text-white transition-colors uppercase">
                Forgot?
              </Link>
            </div>
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors">
                <Lock size={18} strokeWidth={2.5} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full pl-14 pr-14 py-4.5 rounded-[1.8rem] bg-white/[0.03] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-primary/40 focus:bg-white/[0.07] transition-all duration-300"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 group relative py-5 rounded-[1.8rem] bg-primary text-white font-black text-[11px] uppercase tracking-[0.25em] shadow-[0_20px_40px_rgba(var(--p),0.3)] hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden"
          >
             <div className="absolute inset-0 bg-white/10 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300" />
            {isLoading ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <>
                <span className="relative">Start Chatting</span>
                <ArrowRight className="w-4 h-4 relative group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-12 text-center">
          <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:text-white transition-colors ml-1 border-b border-primary/20">
              Sign Up Now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;