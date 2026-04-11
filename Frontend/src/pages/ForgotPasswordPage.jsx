import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../lib/axios";

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
  const inputRefs = [];
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
    if (value && index < 5) inputRefs[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs[index - 1]?.focus();
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black px-4">

      {/* Background Glow */}
      <div className="absolute w-[500px] h-[500px] bg-blue-600/30 blur-[120px] rounded-full top-[-100px] left-[-100px]"></div>
      <div className="absolute w-[400px] h-[400px] bg-purple-600/20 blur-[120px] rounded-full bottom-[-100px] right-[-100px]"></div>

      {/* Card */}
      <div className="relative w-full max-w-md bg-white/5 backdrop-blur-3xl border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.6)] rounded-3xl p-8">

        {/* Header */}
        <div className="text-center mb-6">
         <h1 className="text-7xl font-black text-white tracking-tighter leading-none mb-2">
            गफ<span className="text-primary text-6xl">.</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {step === 1 && "Reset your password"}
            {step === 2 && "Enter verification code"}
            {step === 3 && "Create new password"}
          </p>
        </div>

        {/* Progress */}
        <div className="flex justify-between mb-6 text-xs text-gray-400">
          <span className={step >= 1 ? "text-blue-400" : ""}>Email</span>
          <span className={step >= 2 ? "text-blue-400" : ""}>OTP</span>
          <span className={step >= 3 ? "text-blue-400" : ""}>Reset</span>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 text-sm border border-red-500/20 animate-pulse">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-green-500/10 text-green-400 text-sm border border-green-500/20">
            {success}
          </div>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:scale-[1.02] transition"
              onClick={handleSendOTP}
              disabled={isLoading || !email}
            >
              {isLoading ? <span className="loading loading-spinner" /> : "Send OTP"}
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="flex flex-col gap-4 items-center">
            <div className="flex gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs[index] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="w-11 h-12 text-center text-lg font-bold rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500"
                />
              ))}
            </div>
            <button
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:scale-[1.02] transition"
              onClick={handleVerifyOTP}
              disabled={isLoading}
            >
              {isLoading ? <span className="loading loading-spinner" /> : "Verify OTP"}
            </button>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="flex flex-col gap-4">
            <input
              type="password"
              placeholder="New password"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm password"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:scale-[1.02] transition"
              onClick={handleResetPassword}
              disabled={isLoading}
            >
              {isLoading ? <span className="loading loading-spinner" /> : "Reset Password"}
            </button>
          </div>
        )}

        <button
          className="mt-6 text-sm text-gray-400 hover:text-white transition"
          onClick={() => navigate("/login")}
        >
          ← Back to Login
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;