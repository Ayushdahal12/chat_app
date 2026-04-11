import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import HomePage from "./pages/HomePage";
import OnboardingPage from "./pages/OnboardingPage";
import ChatPage from "./pages/ChatPage";
import VideoCallPage from "./pages/VideoCallPage";
import IncomingCallModal from "./components/IncomingCallModal";

function App() {
  const { authUser, getMe } = useAuthStore();

  useEffect(() => {
    getMe();
  }, []);

  return (
    <>
      {/* Global incoming call popup */}
      {authUser && <IncomingCallModal />}

      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/signup" element={!authUser ? <SignupPage /> : <Navigate to="/" />} />
        <Route path="/onboarding" element={authUser ? <OnboardingPage /> : <Navigate to="/login" />} />
        <Route path="/chat/:id" element={authUser ? <ChatPage /> : <Navigate to="/login" />} />
        <Route path="/call/:id" element={authUser ? <VideoCallPage /> : <Navigate to="/login" />} />
      </Routes>
    </>
  );
}

export default App;