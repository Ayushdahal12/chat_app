import { useSocketStore } from "../store/useSocketStore";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const IncomingCallModal = () => {
  const { incomingCall, clearIncomingCall, socket } = useSocketStore();
  const navigate = useNavigate();
  const [ringing, setRinging] = useState(false);

  useEffect(() => {
    if (incomingCall) {
      setRinging(true);
    }
  }, [incomingCall]);

  if (!incomingCall) return null;

  const handleAccept = () => {
    setRinging(false);
    navigate(`/call/${incomingCall.from}?answer=true`);
  };

  const handleDecline = () => {
    socket?.emit("endCall", { to: incomingCall.from });
    clearIncomingCall();
    setRinging(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="card bg-base-100 w-full max-w-sm shadow-2xl border border-base-300">
        <div className="card-body items-center text-center gap-5 py-8">

          {/* Pulsing avatar */}
          <div className="relative flex items-center justify-center">
            <div className="absolute w-28 h-28 rounded-full bg-success/20 animate-ping" />
            <div className="absolute w-24 h-24 rounded-full bg-success/30 animate-pulse" />
            <div className="avatar z-10">
              <div className="w-20 rounded-full ring-4 ring-success ring-offset-base-100 ring-offset-2">
                <img
                  src={`https://api.dicebear.com/7.x/thumbs/svg?seed=${incomingCall.username}`}
                  alt="caller"
                />
              </div>
            </div>
          </div>

          {/* Caller info */}
          <div className="flex flex-col gap-1">
            <p className="text-base-content/60 text-sm font-medium uppercase tracking-widest">
              Incoming Video Call
            </p>
            <h3 className="text-2xl font-bold">{incomingCall.username || "Someone"}</h3>
            <p className="text-base-content/40 text-sm animate-pulse">
              🎥 wants to video call you...
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-10 mt-2">
            {/* Decline */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={handleDecline}
                className="btn btn-error btn-circle w-16 h-16 text-3xl shadow-lg hover:scale-110 transition-transform"
              >
                📵
              </button>
              <span className="text-xs text-base-content/50 font-medium">Decline</span>
            </div>

            {/* Accept */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={handleAccept}
                className="btn btn-success btn-circle w-16 h-16 text-3xl shadow-lg hover:scale-110 transition-transform animate-bounce"
              >
                📹
              </button>
              <span className="text-xs text-base-content/50 font-medium">Accept</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;