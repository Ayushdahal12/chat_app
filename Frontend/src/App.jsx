import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { Loader2 } from "lucide-react"; // Nice loader
import { SpeedInsights } from "@vercel/speed-insights/react";

// Pages
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import HomePage from "./pages/HomePage";
import OnboardingPage from "./pages/OnboardingPage";
import ChatPage from "./pages/ChatPage";
import VideoCallPage from "./pages/VideoCallPage";
import IncomingCallModal from "./components/IncomingCallModal";
import ProfilePage from "./pages/ProfilePage";
import OTPPage from "./pages/OTPPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import FeedPage from "./pages/FeedPage";

function App() {
  const { authUser, getMe, isCheckingAuth } = useAuthStore();

  // ✅ FIXED: Run getMe() only once on mount
  useEffect(() => {
    getMe();
  }, []); // Empty dependency array - run ONLY ONCE on component mount

  // Use your store's loading state for a cleaner look
  if (isCheckingAuth && !authUser) {
    return (
      <div style={loaderWrapper}>
        <Loader2 size={48} className="animate-spin" style={{ color: "#0a46b3" }} />
        <p style={{ marginTop: "15px", fontWeight: "800", color: "#0a46b3" }}>Connecting to Guff...</p>
      </div>
    );
  }

  // 🛡️ HELPER: Check if user needs onboarding
  // If user exists but has no interests array or it's empty
  const needsOnboarding = authUser && (!authUser.interests || authUser.interests.length === 0);

  return (
    <>
      {authUser && <IncomingCallModal />}

      <Routes>
        {/* If needs onboarding, redirect any home attempt to /onboarding */}
        <Route path="/" element={
          authUser ? (needsOnboarding ? <Navigate to="/onboarding" /> : <HomePage />) : <Navigate to="/login" />
        } />

        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/signup" element={!authUser ? <SignupPage /> : <Navigate to="/" />} />
        
        {/* Only allow onboarding if they are logged in and actually need it */}
        <Route path="/onboarding" element={
          authUser ? <OnboardingPage /> : <Navigate to="/login" />
        } />

        <Route path="/chat/:id" element={authUser ? <ChatPage /> : <Navigate to="/login" />} />
        <Route path="/call/:id" element={authUser ? <VideoCallPage /> : <Navigate to="/login" />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/verify-otp" element={<OTPPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/feed" element={authUser ? <FeedPage /> : <Navigate to="/login" />} />
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      
      <SpeedInsights />
    </>
  );
}

const loaderWrapper = {
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  background: "#f8fafc"
};

export default App;