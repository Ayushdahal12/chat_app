import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useSocketStore } from "../store/useSocketStore";
import { useMessageStore } from "../store/useMessageStore";
import { useAuthStore } from "../store/useAuthStore";
import axiosInstance from "../lib/axios";

const Icon = ({ path, className = "w-6 h-6", color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>{path}</svg>
);

const METERED_API_KEY = "2f6dd2408e5bd09a1b55e685412564098b23";
const METERED_URL = `https://guff-app.metered.live/api/v1/turn/credentials?apiKey=${METERED_API_KEY}`;

const VideoCallPage = () => {
  const { id } = useParams();
  if (!id) {
    console.warn("No user id provided in route params. Redirecting to home.");
    return <div className="text-red-500 p-8">Invalid call: No user ID found.</div>;
  }
  const [searchParams] = useSearchParams();
  const isAnswering = searchParams.get("answer") === "true";
  const navigate = useNavigate();
  
  const { socket, incomingCall, clearIncomingCall } = useSocketStore();
  const { authUser } = useAuthStore();
  const { sendMessage } = useMessageStore();

  const [callDuration, setCallDuration] = useState(0);
  const [remoteUsername, setRemoteUsername] = useState("");
  const [remoteProfilePic, setRemoteProfilePic] = useState("");
  const [status, setStatus] = useState("Connecting...");
  const [myVideoOn, setMyVideoOn] = useState(true);
  const [myAudioOn, setMyAudioOn] = useState(true);
  const [remoteVideoOn, setRemoteVideoOn] = useState(false);

  const myVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const streamRef = useRef(null);
  const pcRef = useRef(null);
  const durationRef = useRef(0);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get("/users/suggested");
        if (!Array.isArray(res.data)) {
          console.warn("/users/suggested did not return an array", res.data);
          return;
        }
        const user = res.data.find(u => u && u._id === id);
        if (user && user.username) {
          setRemoteUsername(user.username);
          setRemoteProfilePic(user.profilePic || "");
        } else {
          console.warn("User not found or missing username for id:", id);
        }
      } catch (e) { console.error("Error fetching user:", e); }
    };
    if (id) fetchUser();
  }, [id]);

  useEffect(() => {

    if (!socket) {
      console.warn("Socket not available in VideoCallPage");
      return;
    }

    if (!authUser || !authUser._id) {
      console.warn("authUser or authUser._id missing in VideoCallPage");
      setStatus("User not authenticated");
      return;
    }

    const init = async () => {
      try {

        const turnRes = await fetch(METERED_URL);
        const iceServers = await turnRes.json();
        if (!iceServers || !Array.isArray(iceServers.iceServers)) {
          console.warn("TURN server response missing iceServers", iceServers);
        }

        // 1. Get Local Media

        let stream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }, 
            audio: true 
          });
        } catch (mediaErr) {
          console.error("Could not get user media:", mediaErr);
          setStatus("Media Error");
          return;
        }
        streamRef.current = stream;
        if (myVideoRef.current) myVideoRef.current.srcObject = stream;

        // 2. Setup PeerConnection

        const pc = new RTCPeerConnection({ iceServers: iceServers.iceServers || [] });
        pcRef.current = pc;

        // 3. Add tracks before signaling
        if (stream && pc) {
          stream.getTracks().forEach(track => pc.addTrack(track, stream));
        }

        // 4. Handle Remote Media

        pc.ontrack = (e) => {
          console.log("Track received:", e.track.kind);
          if (e.track.kind === "video" && remoteVideoRef.current && e.streams[0]) {
            remoteVideoRef.current.srcObject = e.streams[0];
            setRemoteVideoOn(true);
            setStatus("Connected");
          }
          if (e.track.kind === "audio" && remoteAudioRef.current && e.streams[0]) {
            remoteAudioRef.current.srcObject = e.streams[0];
          }
        };


        pc.onicecandidate = (e) => {
          if (e.candidate) {
            const toId = isAnswering ? incomingCall?.from : id;
            if (!toId) {
              console.warn("ICE candidate: No recipient id found.", { isAnswering, incomingCall, id });
              return;
            }
            socket.emit("iceCandidate", { 
              to: toId, 
              candidate: e.candidate 
            });
          }
        };

        // 5. Handshake
        if (!isAnswering) {
          setStatus("Ringing...");
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          if (!authUser || !authUser._id) {
            console.warn("Cannot call: authUser or authUser._id missing.", authUser);
            setStatus("User not authenticated");
            return;
          }
          socket.emit("callUser", { to: id, signal: pc.localDescription, from: authUser._id, username: authUser.username });
        } else if (incomingCall && incomingCall.signal && incomingCall.from) {
          await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.signal));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit("answerCall", { to: incomingCall.from, signal: pc.localDescription });
          clearIncomingCall();
        } else {
          console.warn("Incoming call data incomplete:", incomingCall);
        }
      } catch (err) { 
        console.error("WebRTC Error:", err);
        setStatus("Media Error"); 
      }
    };

    socket.on("callAccepted", async (sdp) => {
      if (pcRef.current && sdp) {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
      } else {
        console.warn("callAccepted: pcRef or sdp missing", { pc: pcRef.current, sdp });
      }
    });

    socket.on("iceCandidate", async ({ candidate }) => {
      try {
        if (pcRef.current && candidate) await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        else {
          console.warn("iceCandidate: pcRef or candidate missing", { pc: pcRef.current, candidate });
        }
      } catch (e) { console.error("ICE Error", e); }
    });

    socket.on("callEnded", () => handleExit());

    init();

    return () => {
      socket.off("callAccepted");
      socket.off("iceCandidate");
      socket.off("callEnded");
      streamRef.current?.getTracks().forEach(t => t.stop());
      pcRef.current?.close();
    };
  }, [socket, id]);

  // Timer Logic
  useEffect(() => {
    let interval;
    if (remoteVideoOn) {
      interval = setInterval(() => {
        setCallDuration(prev => {
          durationRef.current = prev + 1;
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [remoteVideoOn]);

  const handleExit = async () => {
    const finalTime = durationRef.current;
    try {
      await sendMessage(
        id,
        "Video Call",
        finalTime > 0 ? "call_ended" : "call_missed",
        finalTime
      );
    } finally {
      navigate(`/chat/${id}`);
    }
  };

  const toggleVideo = () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setMyVideoOn(track.enabled);
    }
  };

  const toggleAudio = () => {
    const track = streamRef.current?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setMyAudioOn(track.enabled);
    }
  };

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-zinc-950 flex flex-col w-full h-[100dvh] overflow-hidden select-none">
      {/* Defensive: Show error if not authenticated or no id */}
      {(!authUser || !authUser._id) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
          <div className="text-red-500 text-lg font-bold">User not authenticated. Please login again.</div>
        </div>
      )}
      <audio ref={remoteAudioRef} autoPlay playsInline />
      
      {/* Remote Video (Full Screen) */}
      <div className="absolute inset-0 z-0">
        {remoteVideoOn ? (
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900">
             <div className="relative">
                <img 
                  src={remoteProfilePic || `https://api.dicebear.com/7.x/thumbs/svg?seed=${remoteUsername}`} 
                  className="w-32 h-32 rounded-full mb-6 border-4 border-white/5 object-cover" 
                  alt="" 
                />
                <div className="absolute inset-0 rounded-full border-4 border-blue-500/30 animate-ping" />
             </div>
             <h2 className="text-white text-2xl font-bold tracking-tight">{remoteUsername}</h2>
             <p className="text-blue-400 text-sm mt-2 font-medium animate-pulse">{status}</p>
          </div>
        )}
      </div>

      {/* Top Bar (Duration & Name) */}
      <div className="relative z-20 p-6 flex justify-between items-start pt-12 sm:pt-6">
        <div className="bg-black/30 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 text-white text-sm font-semibold">
          {remoteUsername || "Connecting..."}
        </div>
        <div className="bg-black/30 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 text-white font-mono text-sm">
          {formatTime(callDuration)}
        </div>
      </div>

      {/* Local PIP (Your Camera) - Responsive Size */}
      <div className="absolute top-28 right-4 sm:top-6 sm:right-6 z-30 transition-all duration-500">
        <div className="w-28 h-40 sm:w-36 sm:h-52 bg-zinc-800 rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl ring-1 ring-black">
          {myVideoOn ? (
            <video 
              ref={myVideoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover scale-x-[-1]" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-800">
               <span className="text-white/20 text-xs font-bold uppercase tracking-widest">Off</span>
            </div>
          )}
        </div>
      </div>

      {/* Control Buttons (Bottom) */}
      <div className="mt-auto relative z-40 flex justify-center items-center gap-6 pb-12 px-6">
        <button 
          onClick={toggleAudio}
          className={`p-4 rounded-3xl transition-all active:scale-90 ${myAudioOn ? 'bg-white/10 backdrop-blur-md text-white' : 'bg-red-500 text-white'}`}
        >
          <Icon path={myAudioOn ? <><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/><line x1="8" x2="16" y1="22" y2="22"/></> : <><path d="m12 19 3-3"/><path d="M2 2l20 20"/><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 .12 1"/><path d="M19 10v2a7 7 0 0 1-12.77 4.23"/><path d="M15 12a3 3 0 0 1-3 3"/></>} />
        </button>

        <button 
          onClick={() => { 
            socket.emit("endCall", { to: isAnswering ? incomingCall?.from : id }); 
            handleExit(); 
          }} 
          className="p-6 bg-red-600 rounded-[2.5rem] text-white shadow-lg shadow-red-600/40 hover:bg-red-700 transition-all active:scale-95 group"
        >
          <div className="rotate-[135deg] group-hover:rotate-[0deg] transition-transform">
            <Icon path={<path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-6.13-6.13 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />} />
          </div>
        </button>

        <button 
          onClick={toggleVideo}
          className={`p-4 rounded-3xl transition-all active:scale-90 ${myVideoOn ? 'bg-white/10 backdrop-blur-md text-white' : 'bg-red-500 text-white'}`}
        >
          <Icon path={myVideoOn ? <><path d="m22 8-6 4 6 4V8Z" /><rect width="14" height="12" x="2" y="6" rx="2" ry="2" /></> : <><path d="m2 2 20 20" /><path d="m16 12 6 4V8l-6 4Z" /><path d="M7 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-1" /></>} />
        </button>
      </div>
    </div>
  );
};

export default VideoCallPage;