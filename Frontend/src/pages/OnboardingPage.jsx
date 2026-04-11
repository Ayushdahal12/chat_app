import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../lib/axios";

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
    setError(""); // Clear error when they start clicking
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

  // Progress calculation for the ring
  const progress = Math.min((selected.length / 3) * 100, 100);

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200/50 p-4 font-sans">
      <div className="max-w-2xl w-full">
        
        {/* PROGRESS INDICATOR */}
        <div className="flex justify-center mb-8">
          <div className="relative flex items-center justify-center">
             <div className="absolute inset-0 rounded-full border-4 border-base-300 opacity-20" />
             <div 
               className="w-16 h-16 rounded-full border-4 border-primary transition-all duration-700 ease-out flex items-center justify-center bg-base-100 shadow-xl"
               style={{ 
                 clipPath: `inset(${(100-progress)}% 0 0 0)`,
                 borderColor: selected.length >= 3 ? '#22c55e' : '' 
               }}
             />
             <span className="absolute font-black text-lg">
               {selected.length >= 3 ? "✅" : selected.length}
             </span>
          </div>
        </div>

        {/* GLASS CARD */}
        <div className="card bg-base-100/80 backdrop-blur-2xl shadow-[0_32px_64px_-15px_rgba(0,0,0,0.2)] border border-base-300 rounded-[3rem] overflow-hidden">
          <div className="card-body p-8 md:p-12 items-center text-center">
            
            <header className="mb-8">
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                What's your vibe?
              </h1>
              <p className="text-base-content/50 font-medium max-w-sm mx-auto">
                Pick at least <span className="text-base-content font-bold">3 interests</span> so we can match you with the right guffs.
              </p>
            </header>

            {error && (
              <div className="alert alert-error rounded-2xl py-3 mb-6 animate-bounce border-none font-bold text-sm shadow-lg shadow-error/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{error}</span>
              </div>
            )}

            {/* INTERESTS GRID */}
            <div className="flex flex-wrap gap-3 justify-center mb-10">
              {interests.map((interest) => {
                const isSelected = selected.includes(interest);
                return (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`
                      btn btn-md md:btn-lg rounded-2xl border-2 transition-all duration-300 capitalize
                      ${isSelected 
                        ? "btn-primary border-primary scale-110 shadow-xl shadow-primary/30 z-10" 
                        : "btn-ghost border-base-300 opacity-60 hover:opacity-100 hover:scale-105 bg-base-200/50"
                      }
                    `}
                  >
                    {isSelected && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="mr-1 animate-in zoom-in"><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                    {interest}
                  </button>
                );
              })}
            </div>

            {/* ACTION BUTTON */}
            <div className="w-full pt-6 border-t border-base-300/50">
              <button
                className={`
                  btn btn-lg w-full md:w-64 rounded-[2rem] border-none transition-all duration-500
                  ${selected.length >= 3 
                    ? "btn-primary shadow-2xl shadow-primary/40 scale-105" 
                    : "btn-disabled opacity-20"
                  }
                `}
                onClick={handleSubmit}
                disabled={isLoading || selected.length < 3}
              >
                {isLoading ? (
                  <span className="loading loading-spinner" />
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="font-black tracking-widest uppercase">Start Guffing</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </div>
                )}
              </button>
              
              <p className="mt-6 text-[10px] uppercase font-black tracking-[0.3em] opacity-30">
                {selected.length} of 3 required
              </p>
            </div>

          </div>
        </div>

        {/* FOOTER DECOR */}
        <p className="text-center mt-8 text-base-content/30 text-xs font-bold uppercase tracking-widest">
          Secured by Guff Protocol • 2026
        </p>
      </div>
    </div>
  );
};

export default OnboardingPage;