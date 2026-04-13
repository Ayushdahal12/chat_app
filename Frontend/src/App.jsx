import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";

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
  const { authUser, getMe, isLoading } = useAuthStore();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const check = async () => {
      await getMe();
      setCheckingAuth(false); // 🔥 STOP LOADING AFTER FIRST CHECK
    };

    check();
  }, []);

  if (checkingAuth) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <>
      {authUser && <IncomingCallModal />}

      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/signup" element={!authUser ? <SignupPage /> : <Navigate to="/" />} />
        <Route path="/onboarding" element={authUser ? <OnboardingPage /> : <Navigate to="/login" />} />
        <Route path="/chat/:id" element={authUser ? <ChatPage /> : <Navigate to="/login" />} />
        <Route path="/call/:id" element={authUser ? <VideoCallPage /> : <Navigate to="/login" />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/verify-otp" element={<OTPPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/feed" element={authUser ? <FeedPage /> : <Navigate to="/login" />} />
      </Routes>
    </>
  );
}

export default App;