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

  // 🔥 Real Email Validation
  const isValidEmail = (email) =>
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

  // 🔥 Standard Password Validation (1 Uppercase, 1 Lowercase, 6+ chars)
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
      padding: "1rem",
      background: "#083aa9", 
    }}>
      <AnimatePresence>
        {!showExit && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ x: "-100vw", opacity: 0 }}
            style={{
              width: "100%",
              maxWidth: "950px",
              minHeight: "600px",
              backgroundColor: "#ffffff",
              borderRadius: "3rem",
              display: "flex",
              flexDirection: "row",
              overflow: "hidden",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            }}
          >
            {/* LEFT SIDE: BRANDING (NOW ON LEFT) */}
            <div style={{
              flex: 1,
              background: "linear-gradient(180deg, #2563eb 0%, #0a46b3 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              color: "white",
              padding: "40px",
              textAlign: "center"
            }}>
              <h1 style={{ fontSize: "100px", fontWeight: "900", margin: 0, lineHeight: 1 }}>
                गफ<span style={{ color: "#60a5fa" }}>.</span>
              </h1>
              <p style={{ fontSize: "18px", marginTop: "20px", fontWeight: "500", opacity: 0.9 }}>
                Welcome back. <br />
                Nepal's best chatting app.
              </p>
              <p style={{ marginTop: "40px", fontSize: "12px", opacity: 0.6, letterSpacing: "2px" }}>
                BY AYUSH____
              </p>
            </div>

            {/* RIGHT SIDE: FORM (NOW ON RIGHT) */}
            <div style={{
              flex: 1,
              padding: "60px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              background: "#ffffff"
            }}>
              <h2 style={{ fontSize: "32px", fontWeight: "900", color: "#111", marginBottom: "4px" }}>Sign up</h2>
              <p style={{ fontSize: "12px", color: "#9ca3af", fontWeight: "600", letterSpacing: "1px", marginBottom: "30px" }}>CREATE YOUR ACCOUNT</p>

              {error && (
                <p style={{ color: "#ef4444", fontSize: "13px", marginBottom: "15px", fontWeight: "600" }}>{error}</p>
              )}

              <form onSubmit={handleSubmit}>
                <label style={labelStyle}>USERNAME</label>
                <Input icon={<User size={18} />} placeholder="your_name" 
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />

                <label style={labelStyle}>EMAIL ADDRESS</label>
                <Input icon={<Mail size={18} />} placeholder="name@email.com" 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />

                <label style={labelStyle}>PASSWORD</label>
                <div style={{ position: "relative" }}>
                  <Input 
                    icon={<Lock size={18} />} 
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
                      right: "15px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      color: "#0a46b3",
                      fontSize: "11px",
                      fontWeight: "800",
                      cursor: "pointer"
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : "SHOW"}
                  </button>
                </div>

                <button type="submit" disabled={loading} style={buttonStyle}>
                  {loading ? <Loader2 className="animate-spin mx-auto" /> : (
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      START CHATTING <ArrowRight size={18} />
                    </span>
                  )}
                </button>
              </form>

              <p style={{ marginTop: "30px", fontSize: "13px", textAlign: "center", fontWeight: "700", color: "#666" }}>
                Already have an account?{" "}
                <Link to="/login" style={{ color: "#0a46b3", textDecoration: "none", fontWeight: "900" }}>
                   LOGIN
                </Link>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Styles
const labelStyle = {
  display: "block",
  fontSize: "11px",
  fontWeight: "800",
  color: "#9ca3af",
  marginBottom: "8px",
  marginTop: "15px"
};

const buttonStyle = {
  width: "100%",
  padding: "18px",
  background: "#0a46b3",
  color: "white",
  borderRadius: "100px",
  fontWeight: "800",
  marginTop: "30px",
  border: "none",
  cursor: "pointer",
  boxShadow: "0 10px 20px -5px rgba(10, 70, 179, 0.4)",
  fontSize: "14px"
};

const Input = ({ icon, ...props }) => (
  <div style={{ position: "relative" }}>
    <div style={{ position: "absolute", left: "15px", top: "50%", transform: "translateY(-50%)", color: "#d1d5db" }}>
      {icon}
    </div>
    <input
      {...props}
      style={{
        width: "100%",
        padding: "16px 16px 16px 45px",
        borderRadius: "18px",
        border: "1px solid #f3f4f6",
        background: "#f9fafb",
        outline: "none",
        fontSize: "15px",
        color: "#000"
      }}
    />
  </div>
);

export default SignupPage;