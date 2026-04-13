import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ArrowRight, Loader2, X, CheckCircle2 } from "lucide-react";
import axiosInstance from "../lib/axios";

const OTPPage = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [serverOtp, setServerOtp] = useState("");
  const [showPopup, setShowPopup] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  const userId = location.state?.userId;
  const email = location.state?.email || "your email";

  useEffect(() => {
    const otpFromStorage = sessionStorage.getItem("otp_code");
    if (otpFromStorage) setServerOtp(otpFromStorage);
    const timer = setTimeout(() => setShowPopup(false), 30000);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Keep only the last character entered
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Move to previous box on backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    const code = otp.join("");
    if (code.length !== 6) return;

    try {
      setLoading(true);
      await axiosInstance.post("/auth/verify-otp", { userId, otp: code });
      
      sessionStorage.removeItem("otp_code");
      
      // Close popup and show success check
      setShowPopup(false);
      setIsVerified(true);

      // Smooth transition to Onboarding
      setTimeout(() => {
        navigate("/onboarding");
      }, 1500);

    } catch (err) {
      alert(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      {/* DEMO OTP NOTIFICATION */}
      <AnimatePresence>
        {showPopup && serverOtp && !isVerified && (
          <motion.div initial={{ y: -100 }} animate={{ y: 0 }} exit={{ y: -100 }} style={popupStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={iconBadgeStyle}>📩</div>
              <div>
                <p style={{ margin: 0, fontSize: '10px', fontWeight: '900', color: '#94a3b8' }}>OTP FOR TESTING</p>
                <p style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#1e40af', letterSpacing: '4px' }}>{serverOtp}</p>
              </div>
            </div>
            <button onClick={() => setShowPopup(false)} style={closeBtnStyle}><X size={16}/></button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={cardStyle}>
        
        <AnimatePresence mode="wait">
          {!isVerified ? (
            <motion.div key="form" exit={{ opacity: 0, scale: 0.9 }}>
              <div style={shieldIconStyle}><ShieldCheck size={32} color="white" /></div>
              <h1 style={{ fontSize: "24px", fontWeight: "900", color: "#0f172a", marginBottom: "8px" }}>Verify Account</h1>
              <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "30px" }}>Code sent to <span style={{ color: "#0a46b3", fontWeight: "700" }}>{email}</span></p>

              <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginBottom: "30px" }}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    maxLength={1}
                    value={digit}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onChange={(e) => handleChange(i, e.target.value)}
                    autoComplete="one-time-code"
                    style={{
                      width: "45px",
                      height: "55px",
                      borderRadius: "12px",
                      textAlign: "center",
                      fontSize: "24px",
                      fontWeight: "900",
                      outline: "none",
                      transition: "all 0.2s",
                      color: "#000000", // FORCE BLACK TEXT
                      border: digit ? "2px solid #0a46b3" : "2px solid #e2e8f0",
                      background: digit ? "#f0f7ff" : "#f8fafc"
                    }}
                  />
                ))}
              </div>

              <button onClick={handleSubmit} disabled={loading || otp.includes("")} style={verifyBtnStyle}>
                {loading ? <Loader2 className="animate-spin" /> : <>VERIFY OTP <ArrowRight size={18} /></>}
              </button>
            </motion.div>
          ) : (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} style={{ padding: "40px 0" }}>
              <div style={successCircleStyle}>
                <CheckCircle2 size={45} color="white" />
              </div>
              <h2 style={{ fontSize: "22px", fontWeight: "900", color: "#0f172a", margin: 0 }}>Verified!</h2>
              <p style={{ fontSize: "14px", color: "#64748b", marginTop: "10px" }}>Getting things ready...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

// Styles
const containerStyle = { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a46b3", padding: "20px", fontFamily: "Inter, sans-serif" };
const cardStyle = { background: "white", padding: "50px 40px", borderRadius: "3rem", boxShadow: "0 25px 50px rgba(0,0,0,0.3)", width: "100%", maxWidth: "400px", textAlign: "center" };
const popupStyle = { position: 'fixed', top: '20px', background: 'white', padding: '15px 25px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '350px', zIndex: 100, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' };
const iconBadgeStyle = { width: "40px", height: "40px", background: "#eff6ff", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" };
const shieldIconStyle = { background: "#0a46b3", width: "60px", height: "60px", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px auto" };
const successCircleStyle = { background: "#22c55e", width: "80px", height: "80px", borderRadius: "100px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px auto", boxShadow: "0 10px 20px rgba(34, 197, 94, 0.3)" };
const verifyBtnStyle = { width: "100%", padding: "18px", background: "#0a46b3", color: "white", borderRadius: "100px", border: "none", fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", cursor: "pointer", fontSize: "14px" };
const closeBtnStyle = { background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' };

export default OTPPage;