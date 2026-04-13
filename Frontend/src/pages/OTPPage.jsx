import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../lib/axios";

const OTPPage = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [serverOtp, setServerOtp] = useState("");
  const [showPopup, setShowPopup] = useState(true);
  const [timeLeft, setTimeLeft] = useState(30);

  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  const userId = location.state?.userId;
  const email = location.state?.email;

  // =========================
  // LOAD OTP FROM STORAGE + POPUP TIMER
  // =========================
  useEffect(() => {
    const otpFromStorage = sessionStorage.getItem("otp_code");

    if (otpFromStorage) {
      setServerOtp(otpFromStorage);
    }

    const popupTimer = setTimeout(() => {
      setShowPopup(false);
    }, 30000);

    return () => clearTimeout(popupTimer);
  }, []);

  // =========================
  // COUNTDOWN TIMER
  // =========================
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  // =========================
  // INPUT HANDLER
  // =========================
  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // =========================
  // VERIFY OTP
  // =========================
  const handleSubmit = async () => {
    const code = otp.join("");

    if (code.length !== 6) {
      alert("Please enter 6-digit OTP");
      return;
    }

    try {
      await axiosInstance.post("/auth/verify-otp", {
        userId,
        otp: code,
      });

      // clear OTP after success
      sessionStorage.removeItem("otp_code");

      navigate("/onboarding");
    } catch (err) {
      alert(err.response?.data?.message || "Invalid OTP");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-600">

      {/* ================= POPUP ================= */}
      {showPopup && serverOtp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl text-center w-80 shadow-xl">

            <h2 className="text-lg font-bold mb-2">
              OTP Sent Successfully
            </h2>

            <p className="text-3xl font-black text-blue-600 tracking-widest">
              {serverOtp}
            </p>

            <p className="text-sm mt-2 text-gray-500">
              Auto hide in {timeLeft}s
            </p>

            <button
              onClick={() => setShowPopup(false)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-xl"
            >
              Close
            </button>

          </div>
        </div>
      )}

      {/* ================= OTP BOX ================= */}
      <div className="bg-white p-8 rounded-2xl shadow-lg">

        <h2 className="text-xl font-bold mb-2">Verify OTP</h2>

        <p className="text-sm mb-4 text-gray-500">
          Sent to <span className="font-semibold">{email}</span>
        </p>

        <div className="flex gap-2 mb-5 justify-center">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              className="w-10 h-12 border rounded text-center text-xl font-bold"
            />
          ))}
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white p-2 rounded-xl font-semibold"
        >
          Verify OTP
        </button>

      </div>
    </div>
  );
};

export default OTPPage;