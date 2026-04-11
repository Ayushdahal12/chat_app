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
    setSelected((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async () => {
    if (selected.length < 3) {
      setError("Please select at least 3 interests!");
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
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-lg shadow-xl bg-base-100">
        <div className="card-body">
          <h1 className="text-3xl font-bold text-center mb-1">What's your vibe? 🎯</h1>
          <p className="text-center text-base-content/60 mb-6">
            Pick at least 3 interests to find your people
          </p>

          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-3 justify-center mb-6">
            {interests.map((interest) => (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`btn btn-sm rounded-full ${
                  selected.includes(interest)
                    ? "btn-primary"
                    : "btn-outline"
                }`}
              >
                {interest}
              </button>
            ))}
          </div>

          <p className="text-center text-base-content/60 text-sm mb-4">
            {selected.length} selected
          </p>

          <button
            className="btn btn-primary w-full"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? <span className="loading loading-spinner" /> : "Let's Go 🚀"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;