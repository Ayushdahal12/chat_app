import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../lib/axios";
import { useAuthStore } from "../store/useAuthStore";
import { useSocketStore } from "../store/useSocketStore";

const OTPPage = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId;
  const email = location.state?.email;

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
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
    // Focus the last filled input or the first empty one
    const nextIndex = Math.min(paste.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Please enter all 6 digits!");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const res = await axiosInstance.post("/auth/verify-otp", {
        userId,
        otp: otpCode,
      });
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
    <div className="min-h-screen flex items-center justify-center bg-base-200/50 p-4">
      <div className="max-w-md w-full">
        
        {/* LOGO AREA */}
        <div className="flex flex-col items-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="w-16 h-16 bg-primary rounded-3xl rotate-12 flex items-center justify-center shadow-2xl shadow-primary/20 mb-6">
             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>
          </div>
          <h1 className="text-7xl font-black text-white tracking-tighter leading-none mb-2">
            verify गफ<span className="text-primary text-6xl">.</span>
          </h1>
        </div>

        {/* MAIN CARD */}
        <div className="card bg-base-100 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.1)] border border-base-300 rounded-[2.5rem] overflow-hidden">
          <div className="card-body p-8 md:p-10 items-center text-center">
            
            <header className="mb-8">
              <p className="text-base-content/50 font-medium">
                We sent a secure code to
              </p>
              <p className="font-black text-primary truncate max-w-[250px] mx-auto mb-1">
                {email || "your email"}
              </p>
            </header>

            {error && (
              <div className="alert alert-error rounded-2xl py-3 mb-6 animate-shake border-none font-bold text-xs shadow-lg shadow-error/10">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-4 w-4" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{error}</span>
              </div>
            )}

            {/* OTP INPUTS */}
            <div className="flex gap-2 md:gap-3 mb-10" onPaste={handlePaste}>
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
                    w-11 h-14 md:w-14 md:h-16 text-center text-2xl font-mono font-black 
                    rounded-2xl transition-all duration-200 border-2
                    ${digit 
                      ? "bg-primary/5 border-primary text-primary shadow-lg shadow-primary/10" 
                      : "bg-base-200 border-base-300 focus:border-primary/50 focus:bg-base-100"
                    }
                  `}
                />
              ))}
            </div>

            <button
              className={`
                btn btn-lg w-full rounded-2xl border-none transition-all duration-300
                ${otp.join("").length === 6 
                  ? "btn-primary shadow-xl shadow-primary/20" 
                  : "btn-ghost bg-base-200 opacity-50"
                }
              `}
              onClick={handleSubmit}
              disabled={isLoading || otp.join("").length !== 6}
            >
              {isLoading ? (
                <span className="loading loading-spinner" />
              ) : (
                <span className="font-black uppercase tracking-widest">Verify & Enter</span>
              )}
            </button>

            <div className="mt-8 flex flex-col gap-2">
              <p className="text-[10px] uppercase font-black tracking-widest opacity-30">
                Didn't receive the code?
              </p>
              <button
                className="text-sm font-bold text-primary hover:underline transition-all"
                onClick={() => navigate("/signup")}
              >
                Try a different email
              </button>
            </div>

          </div>
        </div>

        {/* SECURITY FOOTER */}
        <div className="mt-10 flex items-center justify-center gap-2 opacity-20">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">End-to-End Encrypted</span>
        </div>
        
      </div>
    </div>
  );
};

export default OTPPage;