import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
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

  // ✅ FIX: sessionStorage fallback
  const userId =
    sessionStorage.getItem("otp_userId");

  const email =
    sessionStorage.getItem("otp_email");

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    const otpCode = otp.join("");

    if (!userId) {
      setError("Session expired. Please signup again.");
      return;
    }

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

      useAuthStore.setState({ authUser: res.data });
      useSocketStore.getState().connectSocket(res.data._id);

      // ✅ cleanup
      sessionStorage.removeItem("otp_userId");
      sessionStorage.removeItem("otp_email");

      navigate("/onboarding");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a46b3] p-6">
      <div className="text-center mb-8">
        <h1 className="text-6xl font-black text-white">
          verify गफ<span className="text-blue-300">.</span>
        </h1>
      </div>

      <div className="w-full max-w-[500px] bg-white rounded-[3rem] p-8">
        <p className="text-center text-gray-500">
          We sent code to {email || "your email"}
        </p>

        {error && (
          <div className="text-red-500 text-center mt-4">{error}</div>
        )}

        <div className="flex justify-between mt-6">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              className="w-12 h-16 text-center border"
            />
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-4 mt-6"
        >
          {isLoading ? <Loader2 className="animate-spin" /> : "Verify"}
        </button>
      </div>
    </div>
  );
};

export default OTPPage;