import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../lib/axios";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showExit, setShowExit] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const isValidEmail = (email) =>
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

  const isStandardPassword = (pass) => 
    /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/.test(pass);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isValidEmail(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (formData.username.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }
    if (!isStandardPassword(formData.password)) {
      setError("Password needs 6+ chars, 1 Uppercase, and 1 Lowercase");
      return;
    }

    try {
      setLoading(true);
      const res = await axiosInstance.post("/auth/signup", formData);
      const { userId, email, otp } = res.data;

      if (!userId) {
        setError("Signup failed");
        return;
      }

      sessionStorage.setItem("otp_code", otp);
      setShowExit(true);

      setTimeout(() => {
        navigate("/verify-otp", { state: { userId, email } });
      }, 600);
    } catch (err) {
      setError(err.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      background: "#083aa9", 
      fontFamily: "Inter, system-ui, sans-serif"
    }}>
      <AnimatePresence>
        {!showExit && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ x: "-100vw", opacity: 0 }}
            style={{
              width: "100%",
              maxWidth: "880px", // Reduced from 1000px
              minHeight: "540px", // Reduced from 640px
              backgroundColor: "#ffffff",
              borderRadius: "3.5rem",
              display: "flex",
              flexDirection: "row",
              overflow: "hidden",
              boxShadow: "0 30px 70px -15px rgba(0, 0, 0, 0.4)",
            }}
          >
            {/* LEFT SIDE: BRANDING */}
            <div style={{
              flex: 1,
              background: "linear-gradient(180deg, #2563eb 0%, #0a46b3 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              color: "white",
              padding: "30px",
              textAlign: "center"
            }}>
              <h1 style={{ fontSize: "90px", fontWeight: "900", margin: 0, lineHeight: 0.8, letterSpacing: "-4px" }}>
                गफ<span style={{ color: "#60a5fa" }}>.</span>
              </h1>
              <p style={{ fontSize: "16px", marginTop: "20px", fontWeight: "500", opacity: 0.9 }}>
                Welcome back. <br />
                Nepal's best chatting app.
              </p>
              <p style={{ marginTop: "40px", fontSize: "11px", opacity: 0.5, letterSpacing: "2px", fontWeight: "700" }}>
                BY AYUSH____
              </p>
            </div>

            {/* RIGHT SIDE: FORM */}
            <div style={{
              flex: 1.1,
              padding: "40px 50px", // Reduced padding
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              background: "#ffffff"
            }}>
              <h2 style={{ fontSize: "28px", fontWeight: "900", color: "#000", marginBottom: "2px" }}>Sign up</h2>
              <p style={{ fontSize: "10px", color: "#9ca3af", fontWeight: "800", letterSpacing: "1.2px", marginBottom: "25px" }}>CONNECT TO YOUR ACCOUNT</p>

              {error && (
                <div style={{ background: "#fef2f2", padding: "10px", borderRadius: "10px", marginBottom: "15px" }}>
                  <p style={{ color: "#ef4444", fontSize: "12px", fontWeight: "700", margin: 0 }}>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <label style={labelStyle}>USERNAME</label>
                <Input icon={<User size={16} />} placeholder="your_name" 
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />

                <label style={labelStyle}>EMAIL ADDRESS</label>
                <Input icon={<Mail size={16} />} placeholder="name@email.com" 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />

                <label style={labelStyle}>PASSWORD</label>
                <div style={{ position: "relative" }}>
                  <Input 
                    icon={<Lock size={16} />} 
                    placeholder="••••••••" 
                    type={showPassword ? "text" : "password"} 
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "18px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      color: "#0a46b3",
                      fontSize: "10px",
                      fontWeight: "900",
                      cursor: "pointer"
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : "SHOW"}
                  </button>
                </div>

                <button type="submit" disabled={loading} style={buttonStyle}>
                  {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : (
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      START CHATTING <ArrowRight size={18} />
                    </span>
                  )}
                </button>
              </form>

              <div style={{ marginTop: "25px", textAlign: "center" }}>
                <span style={{ fontSize: "11px", fontWeight: "800", color: "#9ca3af" }}>
                  ALREADY HAVE AN ACCOUNT?{" "}
                </span>
                <Link to="/login" style={{ 
                  color: "#0a46b3", 
                  textDecoration: "none", 
                  fontWeight: "900", 
                  fontSize: "11px",
                  marginLeft: "4px",
                  borderBottom: "2px solid #0a46b3"
                }}>
                   LOGIN
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const labelStyle = {
  display: "block",
  fontSize: "9px",
  fontWeight: "900",
  color: "#9ca3af",
  marginBottom: "8px",
  marginTop: "15px",
  letterSpacing: "0.5px"
};

const buttonStyle = {
  width: "100%",
  padding: "16px",
  background: "#0a46b3",
  color: "white",
  borderRadius: "100px",
  fontWeight: "900",
  marginTop: "25px",
  border: "none",
  cursor: "pointer",
  boxShadow: "0 12px 24px -8px rgba(10, 70, 179, 0.4)",
  fontSize: "13px"
};

const Input = ({ icon, ...props }) => (
  <div style={{ position: "relative" }}>
    <div style={{ position: "absolute", left: "18px", top: "50%", transform: "translateY(-50%)", color: "#d1d5db" }}>
      {icon}
    </div>
    <input
      {...props}
      style={{
        width: "100%",
        padding: "14px 18px 14px 48px",
        borderRadius: "16px",
        border: "1px solid #f3f4f6",
        background: "#f9fafb",
        outline: "none",
        fontSize: "14px",
        color: "#000"
      }}
    />
  </div>
);

export default SignupPage;