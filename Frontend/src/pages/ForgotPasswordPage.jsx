import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../lib/axios";
import { Mail, Lock, ShieldCheck, ArrowLeft, Loader2, KeyRound } from "lucide-react";
import { motion } from "framer-motion";

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userId, setUserId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  const handleSendOTP = async () => {
    if (!email) return;
    setIsLoading(true);
    setError("");
    try {
      const res = await axiosInstance.post("/auth/forgot-password", { email });
      setUserId(res.data.userId);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Please enter all 6 digits!");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await axiosInstance.post("/auth/verify-forgot-otp", { userId, otp: otpCode });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters!");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match!");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await axiosInstance.post("/auth/reset-password", { userId, newPassword });
      setSuccess("Password reset successfully!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a46b3] p-4 font-sans overflow-hidden">
      <div className="relative w-full max-w-[900px] min-h-[600px] bg-white rounded-[3.5rem] shadow-2xl flex flex-col md:flex-row-reverse overflow-hidden border border-white/20">
        
        {/* BRANDING PANEL (Right Side) */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-[#1e60ff] to-[#0a46b3] relative p-12 text-white flex-col justify-center items-center overflow-hidden">
          <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="relative z-10 text-center">
            <h1 className="text-7xl font-black tracking-tighter leading-none mb-4">गफ<span className="text-blue-300">.</span></h1>
            <p className="text-blue-100/70 text-sm font-medium">Secure your account access.</p>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mt-12">BY AYUSH____</p>
          </div>
        </div>

        {/* CONTENT AREA (Left Side) */}
        <div className="w-full md:w-1/2 p-8 md:p-14 bg-white flex flex-col justify-center">
          
          <div className="mb-8">
            <h2 className="text-3xl font-black text-gray-950 mb-1 tracking-tight">
              {step === 1 && "Forgot Access?"}
              {step === 2 && "Verify OTP"}
              {step === 3 && "New Password"}
            </h2>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
              {step === 1 && "We'll help you get back in"}
              {step === 2 && "Check your inbox for the code"}
              {step === 3 && "Set a strong new password"}
            </p>
          </div>

          {/* Progress Indicators */}
          <div className="flex gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= s ? "bg-[#0a46b3]" : "bg-gray-100"}`} />
            ))}
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase text-center animate-shake">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-3 rounded-xl bg-green-50 border border-green-100 text-green-600 text-[10px] font-black uppercase text-center">
              {success}
            </div>
          )}

          {/* Step 1: Email Input */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Account Email</label>
                <div className="relative group">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#0a46b3]" size={18} />
                  <input 
                    type="email" required placeholder="name@email.com" 
                    className="w-full pl-14 pr-6 py-5 rounded-[1.8rem] bg-gray-50 border border-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <button 
                onClick={handleSendOTP} disabled={isLoading || !email}
                className="w-full bg-[#0a46b3] text-white py-5 rounded-[1.8rem] font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Request Secure Code"}
              </button>
            </div>
          )}

          {/* Step 2: OTP Input */}
          {step === 2 && (
            <div className="space-y-8">
              <div className="flex justify-between gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text" maxLength={1} value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-11 h-16 md:h-20 text-center text-2xl font-black rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-[#0a46b3] focus:outline-none transition-all"
                  />
                ))}
              </div>
              <button 
                onClick={handleVerifyOTP} disabled={isLoading}
                className="w-full bg-[#0a46b3] text-white py-5 rounded-[1.8rem] font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Identity"}
              </button>
            </div>
          )}

          {/* Step 3: Password Reset */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">New Password</label>
                <div className="relative group">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#0a46b3]" size={18} />
                  <input 
                    type="password" placeholder="••••••••" 
                    className="w-full pl-14 pr-6 py-5 rounded-[1.8rem] bg-gray-50 border border-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all text-sm"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Confirm Password</label>
                <div className="relative group">
                  <KeyRound className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#0a46b3]" size={18} />
                  <input 
                    type="password" placeholder="••••••••" 
                    className="w-full pl-14 pr-6 py-5 rounded-[1.8rem] bg-gray-50 border border-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all text-sm"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
              <button 
                onClick={handleResetPassword} disabled={isLoading}
                className="w-full bg-[#0a46b3] text-white py-5 rounded-[1.8rem] font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Update Password"}
              </button>
            </div>
          )}

          <div className="mt-8 text-center">
            <button onClick={() => navigate("/login")} className="flex items-center justify-center gap-2 mx-auto text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#0a46b3] transition-all">
              <ArrowLeft size={14} strokeWidth={3} />
              Return to Login
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;