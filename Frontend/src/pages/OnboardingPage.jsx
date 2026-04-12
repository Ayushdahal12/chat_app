import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../lib/axios";
import { Check, ArrowRight, Loader2, Sparkles } from "lucide-react";

const interests = [
  "Technology", "Music", "Gaming", "Travel", "Food",
  "Sports", "Art", "Fashion", "Business", "Management",
  "Movies", "Books", "Fitness", "Photography", "Science",
];

const OnboardingPage = () => {
  const [selected, setSelected] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

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
      await axios.put("/users/update-interests", { interests: selected });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a46b3] p-6 font-sans select-none overflow-hidden">
      
      {/* BRANDING TOP */}
      <div className="text-center mb-8">
        <h1 className="text-6xl md:text-7xl font-black text-white tracking-tighter leading-none">
          गफ<span className="text-blue-300">.</span>
        </h1>
      </div>

      {/* MAIN CARD */}
      <div className="w-full max-w-[750px] bg-white rounded-[3.5rem] shadow-2xl p-8 md:p-14 border border-white/20">
        
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-4">
            <Sparkles size={14} className="text-[#0a46b3]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#0a46b3]">Personalize</span>
          </div>
          <h2 className="text-4xl font-black text-gray-950 tracking-tight mb-2">What's your vibe?</h2>
          <p className="text-gray-400 text-sm font-medium">
            Select at least <span className="text-[#0a46b3] font-bold">3 interests</span> to customize your feed.
          </p>
        </header>

        {error && (
          <div className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase text-center animate-bounce">
            {error}
          </div>
        )}

        {/* INTERESTS CHIPS */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {interests.map((interest) => {
            const isSelected = selected.includes(interest);
            return (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`
                  px-6 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 border-2
                  ${isSelected 
                    ? "bg-[#0a46b3] border-[#0a46b3] text-white shadow-xl shadow-blue-500/20 scale-105" 
                    : "bg-gray-50 border-gray-100 text-gray-400 hover:border-blue-200 hover:text-gray-600"
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  {isSelected && <Check size={16} strokeWidth={4} className="animate-in zoom-in" />}
                  {interest}
                </div>
              </button>
            );
          })}
        </div>

        {/* PROGRESS & SUBMIT */}
        <div className="flex flex-col items-center gap-6 pt-8 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex gap-1.5">
              {[1, 2, 3].map((s) => (
                <div 
                  key={s} 
                  className={`h-2 w-8 rounded-full transition-all duration-500 ${selected.length >= s ? "bg-[#0a46b3]" : "bg-gray-100"}`} 
                />
              ))}
            </div>
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
              {selected.length}/3 Required
            </span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading || selected.length < 3}
            className="w-full md:w-80 bg-[#0a46b3] text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all disabled:opacity-20 flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Start Guffing</span>
                <ArrowRight size={18} strokeWidth={3} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <p className="mt-8 text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">
        By Ayush____ • 2026
      </p>
    </div>
  );
};

export default OnboardingPage;