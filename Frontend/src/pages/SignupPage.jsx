import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Loader2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../lib/axios";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setIsLoading(true);

      const res = await axiosInstance.post("/auth/signup", formData);

      const { userId, email, otp } = res.data;

      if (!userId) {
        setError("Signup failed. Try again.");
        return;
      }

      // store OTP for popup UI
      sessionStorage.setItem("otp_code", otp);

      setIsExiting(true);

      setTimeout(() => {
        navigate("/verify-otp", {
          state: { userId, email }
        });
      }, 500);

    } catch (err) {
      setError(err.response?.data?.message || "Server error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 overflow-hidden"
      style={{
        background: "#0a46b3",
        fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
      }}
    >
      <AnimatePresence>
        {!isExiting && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ x: "-120vw", opacity: 0, transition: { duration: 0.7 } }}
            style={{
              width: "100%",
              maxWidth: 900,
              minHeight: 600,
              borderRadius: "3.5rem",
              boxShadow: "0 60px 120px -15px rgba(0,0,0,0.35)",
              display: "flex",
              flexDirection: "row",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.2)",
              flexWrap: "wrap",
            }}
          >

            {/* ── LEFT BRAND SIDE ── */}
            <div
              style={{
                flex: "1 1 300px",
                background: "linear-gradient(135deg, #1e60ff 0%, #0a46b3 100%)",
                position: "relative",
                padding: "48px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
              }}
            >
              <div style={{
                position: "absolute",
                bottom: -80,
                left: -80,
                width: 400,
                height: 400,
                background: "rgba(255,255,255,0.1)",
                borderRadius: "50%",
                filter: "blur(120px)"
              }} />

              <div style={{ position: "relative", textAlign: "center" }}>
                <h1 style={{
                  fontSize: "clamp(70px, 10vw, 100px)",
                  fontWeight: 900,
                  color: "#fff",
                  letterSpacing: "-3px"
                }}>
                  गफ<span style={{ color: "#93c5fd" }}>.</span>
                </h1>

                <p style={{
                  color: "rgba(219,234,254,0.7)",
                  fontSize: 13,
                  marginTop: 10
                }}>
                  Join Nepal’s fastest chat community
                </p>

                <p style={{
                  fontSize: 9,
                  fontWeight: 900,
                  color: "rgba(255,255,255,0.3)",
                  marginTop: 40,
                  letterSpacing: "0.4em",
                  textTransform: "uppercase"
                }}>
                  BY AYUSH____
                </p>
              </div>
            </div>

            {/* ── FORM SIDE ── */}
            <div
              style={{
                flex: "1 1 300px",
                padding: "48px 56px",
                background: "#fff",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <h2 style={{
                fontSize: 30,
                fontWeight: 900,
                marginBottom: 6,
                color: "#0a0a0a"
              }}>
                Create account
              </h2>

              <p style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#9ca3af",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                marginBottom: 24
              }}>
                Join the Guff community
              </p>

              {error && (
                <div style={{
                  background: "#fef2f2",
                  color: "#dc2626",
                  padding: 12,
                  borderRadius: 12,
                  marginBottom: 16,
                  fontSize: 11,
                  fontWeight: 900,
                  textTransform: "uppercase"
                }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

                {/* Username */}
                <Input icon={<User size={18} />} placeholder="Username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />

                {/* Email */}
                <Input icon={<Mail size={18} />} placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />

                {/* Password */}
                <Input icon={<Lock size={18} />} type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    background: "#0a46b3",
                    color: "#fff",
                    padding: 18,
                    borderRadius: 18,
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    border: "none",
                    cursor: "pointer"
                  }}
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : "Create Account"}
                </button>
              </form>

              <p style={{
                marginTop: 30,
                fontSize: 10,
                fontWeight: 700,
                color: "#9ca3af",
                textAlign: "center",
                textTransform: "uppercase",
                letterSpacing: "0.2em"
              }}>
                Already have account?{" "}
                <Link to="/login" style={{ color: "#0a46b3", fontWeight: 900 }}>
                  Login
                </Link>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// reusable input
const Input = ({ icon, ...props }) => (
  <div style={{ position: "relative" }}>
    <div style={{
      position: "absolute",
      left: 18,
      top: "50%",
      transform: "translateY(-50%)",
      color: "#9ca3af"
    }}>
      {icon}
    </div>

    <input
      {...props}
      style={{
        width: "100%",
        padding: "16px 16px 16px 48px",
        borderRadius: 16,
        border: "1px solid #e5e7eb",
        background: "#f9fafb",
        fontSize: 14,
        outline: "none",
        color: "#111827"
      }}
    />
  </div>
);

export default SignupPage;