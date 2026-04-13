import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../lib/axios";
import { useAuthStore } from "../store/useAuthStore";
import { useSocketStore } from "../store/useSocketStore";
import { Loader2, ShieldCheck, ArrowLeft } from "lucide-react";

const OTPPage = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Data passed from SignupPage
  const userId = location.state?.userId;
  const email = location.state?.email;

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(paste)) return;
    const newOtp = paste.split("");
    const filledOtp = [...newOtp, ...Array(6 - newOtp.length).fill("")];
    setOtp(filledOtp);
    const nextIndex = Math.min(paste.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Enter 6-digit code");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const res = await axiosInstance.post("/auth/verify-otp", {
        userId,
        otp: otpCode,
      });
      // Set the user in global state and connect socket
      useAuthStore.setState({ authUser: res.data });
      useSocketStore.getState().connectSocket(res.data._id);
      navigate("/onboarding");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a46b3] p-6 font-sans select-none overflow-hidden">
      
      {/* BRANDING TOP */}
      <div className="text-center mb-8">
        <h1 className="text-6xl md:text-7xl font-black text-white tracking-tighter leading-none">
          verify गफ<span className="text-blue-300">.</span>
        </h1>
      </div>

      {/* COMPACT CARD */}
      <div className="w-full max-w-[500px] bg-white rounded-[3rem] shadow-2xl p-8 md:p-12 border border-white/20">
        <div className="text-center mb-10">
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Secure Verification</p>
          <p className="text-gray-500 text-sm font-medium">
            We sent a code to <span className="text-[#0a46b3] font-bold">{email || "your email"}</span>
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase text-center">
            {error}
          </div>
        )}

        {/* OTP INPUTS */}
        <div className="flex justify-between gap-2 mb-10" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`
                w-12 h-16 md:w-14 md:h-20 text-center text-2xl font-black 
                rounded-[1.2rem] transition-all duration-200 border-2
                ${digit 
                  ? "bg-blue-50 border-[#0a46b3] text-[#0a46b3] shadow-lg shadow-blue-500/10" 
                  : "bg-gray-50 border-gray-100 focus:border-[#0a46b3]/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/5"
                }
              `}
            />
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={isLoading || otp.join("").length !== 6}
          className="w-full bg-[#0a46b3] text-white py-5 rounded-[1.8rem] font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <span>Verify & Enter</span>
              <ShieldCheck size={18} />
            </>
          )}
        </button>

        <div className="mt-8 flex flex-col items-center gap-4">
          <p className="text-[10px] uppercase font-black tracking-widest text-gray-400">
            Didn't receive the code?
          </p>
          <button
            onClick={() => navigate("/signup")}
            className="flex items-center gap-2 text-xs font-black text-[#0a46b3] uppercase tracking-tighter hover:underline"
          >
            <ArrowLeft size={14} strokeWidth={3} />
            Try a different email
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-8 flex items-center gap-2 opacity-30 text-white">
        <ShieldCheck size={14} />
        <span className="text-[9px] font-black uppercase tracking-[0.4em]">Encrypted Session</span>
      </div>
    </div>
  );
};

export default OTPPage; 