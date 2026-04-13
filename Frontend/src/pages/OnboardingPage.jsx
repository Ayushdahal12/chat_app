import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore"; // Ensure this path is correct
import axiosInstance from "../lib/axios";
import { Check, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const interestsList = [
  "Technology", "Music", "Gaming", "Travel", "Food",
  "Sports", "Art", "Fashion", "Business", "Management",
  "Movies", "Books", "Fitness", "Photography", "Science",
];

const OnboardingPage = () => {
  const [selected, setSelected] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();
  const { getMe } = useAuthStore(); // 🔥 This is the key to fixing the redirect!

  const toggleInterest = (interest) => {
    setError("");
    setSelected((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async () => {
    if (selected.length < 3) {
      setError("Pick at least 3 to continue!");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Update backend
      await axiosInstance.put("/users/update-interests", { interests: selected });
      
      // 2. Refresh the local authUser state so App.jsx knows onboarding is done
      await getMe(); 
      
      // 3. Move to home
      navigate("/");
    } catch (err) {
      console.error("Onboarding error:", err);
      setError(err.response?.data?.message || "Something went wrong saving your vibes.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      {/* BRANDING */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }}
        style={{ textAlign: "center", marginBottom: "30px" }}
      >
        <h1 style={{ fontSize: "70px", fontWeight: "900", color: "white", margin: 0, letterSpacing: "-3px" }}>
          गफ<span style={{ color: "#60a5fa" }}>.</span>
        </h1>
      </motion.div>

      {/* MAIN CARD */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={cardStyle}
      >
        <header style={{ textAlign: "center", marginBottom: "30px" }}>
          <div style={badgeStyle}>
            <Sparkles size={12} />
            <span>PERSONALIZE</span>
          </div>
          <h2 style={{ fontSize: "30px", fontWeight: "900", color: "#0f172a", marginBottom: "8px" }}>What's your vibe?</h2>
          <p style={{ fontSize: "14px", color: "#64748b", fontWeight: "500" }}>
            Select <span style={{ color: "#0a46b3", fontWeight: "800" }}>3 or more</span> to customize your feed.
          </p>
        </header>

        {error && (
          <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} style={errorStyle}>
            {error}
          </motion.div>
        )}

        {/* INTERESTS GRID */}
        <div style={chipsContainer}>
          {interestsList.map((interest) => {
            const isSelected = selected.includes(interest);
            return (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                style={{
                  ...chipStyle,
                  background: isSelected ? "#0a46b3" : "#f8fafc",
                  borderColor: isSelected ? "#0a46b3" : "#e2e8f0",
                  color: isSelected ? "white" : "#64748b",
                  transform: isSelected ? "scale(1.05)" : "scale(1)"
                }}
              >
                {isSelected && <Check size={14} strokeWidth={4} style={{ marginRight: "6px" }} />}
                {interest}
              </button>
            );
          })}
        </div>

        {/* BOTTOM SECTION */}
        <div style={footerSection}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "25px" }}>
            <div style={{ display: "flex", gap: "6px" }}>
              {[1, 2, 3].map((s) => (
                <div 
                  key={s} 
                  style={{
                    height: "6px",
                    width: "35px",
                    borderRadius: "10px",
                    background: selected.length >= s ? "#0a46b3" : "#e2e8f0",
                    transition: "all 0.3s ease"
                  }} 
                />
              ))}
            </div>
            <span style={{ fontSize: "10px", fontWeight: "900", color: "#94a3b8", letterSpacing: "1px" }}>
              {selected.length}/3 REQUIRED
            </span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading || selected.length < 3}
            style={{
              ...submitBtnStyle,
              opacity: (selected.length < 3) ? 0.4 : 1,
              cursor: (selected.length < 3) ? "not-allowed" : "pointer"
            }}
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span>START GUFFING</span>
                <ArrowRight size={18} />
              </div>
            )}
          </button>
        </div>
      </motion.div>

      <p style={{ marginTop: "25px", fontSize: "10px", fontWeight: "800", color: "rgba(255,255,255,0.4)", letterSpacing: "2px" }}>
        BY AYUSH____ • 2026
      </p>
    </div>
  );
};

// --- STYLES (Same as previous for consistency) ---
const containerStyle = { minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#0a46b3", padding: "40px 20px", fontFamily: "Inter, sans-serif" };
const cardStyle = { width: "100%", maxWidth: "750px", background: "#ffffff", borderRadius: "3.5rem", padding: "50px", boxShadow: "0 40px 100px rgba(0, 0, 0, 0.4)" };
const badgeStyle = { display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "100px", background: "#eff6ff", color: "#0a46b3", fontSize: "10px", fontWeight: "900", marginBottom: "15px", border: "1px solid #dbeafe" };
const chipsContainer = { display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center", marginBottom: "40px" };
const chipStyle = { padding: "12px 20px", borderRadius: "16px", fontSize: "14px", fontWeight: "700", border: "2px solid", cursor: "pointer", transition: "all 0.2s ease", display: "flex", alignItems: "center" };
const errorStyle = { background: "#fef2f2", padding: "12px", borderRadius: "15px", color: "#ef4444", fontSize: "11px", fontWeight: "800", textAlign: "center", marginBottom: "25px", border: "1px solid #fee2e2" };
const footerSection = { display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "30px", borderTop: "1px solid #f1f5f9" };
const submitBtnStyle = { width: "100%", maxWidth: "300px", padding: "18px", background: "#0a46b3", color: "white", borderRadius: "100px", border: "none", fontWeight: "900", fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 15px 30px rgba(10, 70, 179, 0.4)", transition: "all 0.2s" };

export default OnboardingPage;