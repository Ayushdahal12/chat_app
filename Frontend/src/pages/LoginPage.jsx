import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isExiting, setIsExiting] = useState(false);

  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const res = await login(formData);
    if (res?.success) {
      setIsExiting(true);
      setTimeout(() => navigate("/"), 600);
    } else {
      setError(res?.message || "Invalid email or password");
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
            exit={{ x: "120vw", opacity: 0, transition: { duration: 0.7, ease: "easeIn" } }}
            style={{
              width: "100%",
              maxWidth: 900,
              minHeight: 600,
              borderRadius: "3.5rem",
              boxShadow: "0 60px 120px -15px rgba(0,0,0,0.35)",
              display: "flex",
              flexDirection: "row-reverse",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.2)",
              flexWrap: "wrap",
            }}
          >

            {/* ── RIGHT SIDE — BRANDING ── */}
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
              {/* Glow blobs */}
              <div style={{
                position: "absolute", bottom: -80, right: -80,
                width: 400, height: 400,
                background: "rgba(96,165,250,0.2)",
                borderRadius: "50%", filter: "blur(100px)",
                pointerEvents: "none",
              }} />
              <div style={{
                position: "absolute", top: "25%", left: -100,
                width: 256, height: 256,
                background: "rgba(255,255,255,0.1)",
                borderRadius: "50%", filter: "blur(48px)",
                pointerEvents: "none",
              }} />

              <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
                <h1 style={{
                  fontSize: "clamp(72px, 10vw, 100px)",
                  fontWeight: 900,
                  color: "#ffffff",
                  letterSpacing: "-3px",
                  lineHeight: 1,
                  marginBottom: 24,
                }}>
                  गफ<span style={{ color: "#93c5fd" }}>.</span>
                </h1>
                <p style={{
                  color: "rgba(219,234,254,0.7)",
                  fontSize: 13,
                  fontWeight: 500,
                  lineHeight: 1.7,
                  maxWidth: 200,
                  marginBottom: 32,
                }}>
                  Welcome back.<br />Nepal's best chatting app.
                </p>
                <p style={{
                  fontSize: 9,
                  fontWeight: 900,
                  color: "rgba(255,255,255,0.3)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5em",
                  marginTop: 48,
                }}>
                  BY AYUSH____
                </p>
              </div>
            </div>

            {/* ── LEFT SIDE — FORM ── */}
            <div
              style={{
                flex: "1 1 300px",
                padding: "48px 56px",
                background: "#ffffff",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                colorScheme: "light", /* ✅ Forces light mode always */
              }}
            >
              {/* Heading */}
              <div style={{ marginBottom: 32 }}>
                <h2 style={{
                  fontSize: 30,
                  fontWeight: 900,
                  color: "#0a0a0a", /* ✅ Always black */
                  marginBottom: 8,
                  letterSpacing: "-0.5px",
                }}>
                  Sign in
                </h2>
                <p style={{
                  color: "#9ca3af", /* ✅ Always gray */
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                }}>
                  Connect to your account
                </p>
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  marginBottom: 24,
                  padding: "12px 16px",
                  borderRadius: 16,
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#dc2626",
                  fontSize: 10,
                  fontWeight: 900,
                  textTransform: "uppercase",
                  textAlign: "center",
                  letterSpacing: "0.1em",
                }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                {/* ── EMAIL ── */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{
                    fontSize: 9, fontWeight: 900,
                    color: "#9ca3af", /* ✅ Always gray */
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    marginLeft: 16,
                  }}>
                    Email Address
                  </label>
                  <div style={{ position: "relative" }}>
                    <div style={{
                      position: "absolute", left: 22, top: "50%",
                      transform: "translateY(-50%)",
                      color: "#d1d5db",
                      display: "flex", alignItems: "center",
                      pointerEvents: "none",
                    }}>
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="name@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={{
                        width: "100%",
                        paddingLeft: 52,
                        paddingRight: 24,
                        paddingTop: 18,
                        paddingBottom: 18,
                        borderRadius: "1.8rem",
                        background: "#f9fafb", /* ✅ Always light bg */
                        border: "1.5px solid #f3f4f6",
                        outline: "none",
                        fontSize: 14,
                        color: "#111827", /* ✅ Always dark text */
                        fontFamily: "inherit",
                        boxSizing: "border-box",
                        colorScheme: "light",
                      }}
                      onFocus={e => e.target.style.borderColor = "#0a46b3"}
                      onBlur={e => e.target.style.borderColor = "#f3f4f6"}
                    />
                  </div>
                </div>

                {/* ── PASSWORD ── */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{
                    fontSize: 9, fontWeight: 900,
                    color: "#9ca3af",
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    marginLeft: 16,
                  }}>
                    Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <div style={{
                      position: "absolute", left: 22, top: "50%",
                      transform: "translateY(-50%)",
                      color: "#d1d5db",
                      display: "flex", alignItems: "center",
                      pointerEvents: "none",
                    }}>
                      <Lock size={18} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      style={{
                        width: "100%",
                        paddingLeft: 52,
                        paddingRight: 70,
                        paddingTop: 18,
                        paddingBottom: 18,
                        borderRadius: "1.8rem",
                        background: "#f9fafb", /* ✅ Always light bg */
                        border: "1.5px solid #f3f4f6",
                        outline: "none",
                        fontSize: 14,
                        color: "#111827", /* ✅ Always dark text */
                        fontFamily: "inherit",
                        boxSizing: "border-box",
                        colorScheme: "light",
                      }}
                      onFocus={e => e.target.style.borderColor = "#0a46b3"}
                      onBlur={e => e.target.style.borderColor = "#f3f4f6"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute", right: 22, top: "50%",
                        transform: "translateY(-50%)",
                        background: "none", border: "none",
                        cursor: "pointer",
                        fontSize: 10, fontWeight: 900,
                        color: "#0a46b3",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                      }}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>

                  {/* Forgot password */}
                  <div style={{ textAlign: "right", paddingRight: 8 }}>
                    <Link
                      to="/forgot-password"
                      style={{
                        fontSize: 9, fontWeight: 900,
                        color: "#0a46b3",
                        textTransform: "uppercase",
                        letterSpacing: "0.2em",
                        textDecoration: "none",
                      }}
                    >
                      Forgot Password?
                    </Link>
                  </div>
                </div>

                {/* ── SUBMIT BUTTON ── */}
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    width: "100%",
                    background: "#0a46b3",
                    color: "#ffffff",
                    paddingTop: 20,
                    paddingBottom: 20,
                    borderRadius: "1.8rem",
                    border: "none",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    fontWeight: 900,
                    fontSize: 12,
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    boxShadow: "0 8px 32px rgba(10,70,179,0.35)",
                    opacity: isLoading ? 0.6 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    transition: "all 0.2s",
                    fontFamily: "inherit",
                  }}
                >
                  {isLoading ? (
                    <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                  ) : (
                    <>
                      <span>Start Chatting</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              {/* Sign up link */}
              <div style={{ marginTop: 40, textAlign: "center" }}>
                <p style={{
                  fontSize: 10, fontWeight: 700,
                  color: "#9ca3af", /* ✅ Always gray */
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                }}>
                  New to Guff?{" "}
                  <Link
                    to="/signup"
                    style={{
                      color: "#0a46b3",
                      textDecoration: "none",
                      fontWeight: 900,
                      marginLeft: 4,
                    }}
                  >
                    Create Account
                  </Link>
                </p>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        input::placeholder {
          color: #d1d5db !important;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
