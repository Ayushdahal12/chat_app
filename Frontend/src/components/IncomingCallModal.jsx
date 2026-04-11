import { useSocketStore } from "../store/useSocketStore";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import ringSound from "../assets/Ring.mp3";

// Standardized Icon Component for high-visibility
const Icon = ({ path, className = "w-6 h-6", color = "currentColor" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={color} 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    {path}
  </svg>
);

const IncomingCallModal = () => {
  const { incomingCall, clearIncomingCall, socket } = useSocketStore();
  const navigate = useNavigate();
  const audioRef = useRef(null);

  useEffect(() => {
    if (incomingCall) {
      const audio = new Audio(ringSound);
      audio.loop = true;
      audio.volume = 1.0;
      audioRef.current = audio;
      audio.play().catch(() => {}); 
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [incomingCall]);

  if (!incomingCall) return null;

  const handleAccept = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    navigate(`/call/${incomingCall.from}?answer=true`);
  };

  const handleDecline = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    socket?.emit("endCall", { to: incomingCall.from });
    clearIncomingCall();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md transition-all">
      {/* Background ambient glow matching the call page */}
      <div className="absolute w-[300px] h-[300px] bg-primary/20 blur-[100px] rounded-full animate-pulse" />
      
      <div className="relative w-full max-w-sm bg-[#0a0a0a]/80 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] p-10 shadow-[0_30px_100px_rgba(0,0,0,1)] overflow-hidden">
        
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-white/10 rounded-full mt-4" />

        <div className="flex flex-col items-center text-center">
          
          {/* Pulsing Avatar Section */}
          <div className="relative mb-10 mt-6">
            <div className="absolute inset-0 bg-primary/25 blur-3xl animate-pulse rounded-full" />
            <div className="relative avatar">
              <div className="w-32 h-32 rounded-[2.5rem] ring-[12px] ring-white/5 shadow-2xl overflow-hidden rotate-3 hover:rotate-0 transition-transform duration-500">
                <img
                  src={`https://api.dicebear.com/7.x/thumbs/svg?seed=${incomingCall.username}`}
                  alt="caller"
                />
              </div>
            </div>
          </div>

          {/* Call Status & Info */}
          <div className="space-y-3 mb-12">
            <span className="text-primary font-black uppercase tracking-[0.4em] text-[9px]">
              Secure Video Call
            </span>
            <h3 className="text-4xl font-black text-white tracking-tighter">
              {incomingCall.username || "Unknown"}
            </h3>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest animate-pulse">
              Incoming Request...
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-10">
            
            {/* DECLINE (Vector Icon) */}
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={handleDecline}
                className="group relative w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center transition-all hover:bg-red-500 hover:scale-110 active:scale-95 shadow-lg"
              >
                <Icon 
                  color="#ef4444" 
                  className="w-7 h-7 group-hover:stroke-white transition-colors"
                  path={<path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-6.13-6.13 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/>} 
                  // Note: Rotate this in CSS/ClassName if needed, but path is standard
                />
              </button>
              <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Decline</span>
            </div>

            {/* ACCEPT (Vector Icon) */}
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={handleAccept}
                className="group relative w-16 h-16 rounded-3xl bg-primary flex items-center justify-center shadow-[0_15px_35px_rgba(var(--p),0.4)] transition-all hover:scale-110 active:scale-95 animate-bounce"
              >
                <div className="absolute inset-0 rounded-3xl bg-primary animate-ping opacity-20" />
                <Icon 
                  color="white" 
                  className="w-7 h-7"
                  path={
                    <>
                      <path d="m22 8-6 4 6 4V8Z"/>
                      <rect width="14" height="12" x="2" y="6" rx="2" ry="2"/>
                    </>
                  } 
                />
              </button>
              <span className="text-[9px] font-black text-primary uppercase tracking-widest">Accept</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;