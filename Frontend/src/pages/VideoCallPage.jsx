import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useSocketStore } from "../store/useSocketStore";
import { useAuthStore } from "../store/useAuthStore";
import axiosInstance from "../lib/axios";
import ringSound from "../assets/Ring.mp3";

const Icon = ({ path, className = "w-6 h-6", color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>{path}</svg>
);

const METERED_API_KEY = "2f6dd2408e5bd09a1b55e685412564098b23";
const METERED_URL = `https://guff-app.metered.live/api/v1/turn/credentials?apiKey=${METERED_API_KEY}`;

const VideoCallPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isAnswering = searchParams.get("answer") === "true";
  const navigate = useNavigate();
  
  const { socket, incomingCall, clearIncomingCall } = useSocketStore();
  const { authUser } = useAuthStore();

  // Call States
  const [callDuration, setCallDuration] = useState(0);
  const [callStarted, setCallStarted] = useState(false);
  const [remoteUsername, setRemoteUsername] = useState("");
  const [remoteProfilePic, setRemoteProfilePic] = useState("");
  const [status, setStatus] = useState("Connecting...");
  const [myVideoOn, setMyVideoOn] = useState(true);
  const [myAudioOn, setMyAudioOn] = useState(true);
  const [remoteVideoOn, setRemoteVideoOn] = useState(false);

  // Refs for WebRTC and Cleanup
  const myVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const streamRef = useRef(null);
  const pcRef = useRef(null);
  const timerRef = useRef(null);
  const durationRef = useRef(0);
  const iceCandidatesQueue = useRef([]);

  // Keeps the duration ref updated for the handleExit function
  useEffect(() => { durationRef.current = callDuration; }, [callDuration]);

  // Fetch Remote User Data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get("/users/suggested");
        const user = res.data.find(u => u._id === id);
        if (user) {
          setRemoteUsername(user.username);
          setRemoteProfilePic(user.profilePic);
        }
      } catch (e) { console.error("User Fetch Error:", e); }
    };
    fetchUser();
  }, [id]);

  useEffect(() => {
    if (!socket) return;

    const startCallSequence = async () => {
      try {
        const turnRes = await fetch(METERED_URL);
        const iceServers = await turnRes.json();

        // 1. Get Media FIRST (Critical for showing faces)
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: true
        });
        streamRef.current = stream;
        if (myVideoRef.current) myVideoRef.current.srcObject = stream;

        // 2. Initialize Peer Connection
        const pc = new RTCPeerConnection({ iceServers, iceCandidatePoolSize: 10 });
        pcRef.current = pc;

        // 3. Add Tracks BEFORE the handshake
        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        // 4. Handle Incoming Tracks
        pc.ontrack = (event) => {
          if (event.track.kind === "video" && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
            setRemoteVideoOn(true);
          }
          if (event.track.kind === "audio" && remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = event.streams[0];
          }
        };

        pc.onicecandidate = (e) => {
          if (e.candidate) {
            socket.emit("iceCandidate", { to: isAnswering ? incomingCall.from : id, candidate: e.candidate });
          }
        };

        pc.oniceconnectionstatechange = () => {
          if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
            setCallStarted(true);
            setStatus("Connected");
            // START TIMER
            if (!timerRef.current) {
              timerRef.current = setInterval(() => {
                setCallDuration(prev => prev + 1);
              }, 1000);
            }
          }
        };

        // 5. Signaling Handshake
        if (!isAnswering) {
          setStatus("Ringing...");
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("callUser", { to: id, signal: pc.localDescription, from: authUser._id, username: authUser.username });
        } else {
          await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.signal));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit("answerCall", { to: incomingCall.from, signal: pc.localDescription });
          clearIncomingCall();
        }
      } catch (err) { 
        setStatus("Camera/Mic Error"); 
      }
    };

    socket.on("callAccepted", async (sdp) => {
      if (pcRef.current) {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
        iceCandidatesQueue.current.forEach(c => pcRef.current.addIceCandidate(new RTCIceCandidate(c)));
        iceCandidatesQueue.current = [];
      }
    });

    socket.on("iceCandidate", async ({ candidate }) => {
      if (pcRef.current?.remoteDescription) {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } else {
        iceCandidatesQueue.current.push(candidate);
      }
    });

    socket.on("callEnded", () => handleExit());

    startCallSequence();
    return () => cleanup();
  }, [socket]);

  const cleanup = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    pcRef.current?.close();
    clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const handleExit = async () => {
    const finalDuration = durationRef.current;
    try {
      await axiosInstance.post(`/messages/send/${id}`, {
        text: "Video Call",
        type: finalDuration > 0 ? "call_ended" : "call_missed",
        callDuration: finalDuration
      });
    } finally {
      cleanup();
      navigate(`/chat/${id}`);
    }
  };

  const toggleVideo = () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setMyVideoOn(track.enabled);
      // Force refresh of the local video element
      if (myVideoRef.current) myVideoRef.current.srcObject = streamRef.current;
    }
  };

  const toggleAudio = () => {
    const track = streamRef.current?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setMyAudioOn(track.enabled);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col overflow-hidden w-full h-[100dvh] touch-none select-none">
      <audio ref={remoteAudioRef} autoPlay playsInline />
      
      {/* Remote Video Display */}
      <div className="absolute inset-0 z-0">
        {remoteVideoOn ? (
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950">
            <img src={remoteProfilePic || `https://api.dicebear.com/7.x/thumbs/svg?seed=${remoteUsername}`} className="w-32 h-32 rounded-[3rem] border border-white/10 shadow-2xl mb-4" alt="user" />
            <h2 className="text-2xl font-black text-white">{remoteUsername || "User"}</h2>
            <p className="text-blue-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">{status}</p>
          </div>
        )}
      </div>

      {/* Overlay Elements */}
      <div className="relative z-50 flex flex-col h-full pointer-events-none">
        <header className="p-8 flex justify-between pointer-events-auto">
          <div className="bg-black/40 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${callStarted ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
            <span className="text-white text-[10px] font-black uppercase tracking-widest">{remoteUsername}</span>
          </div>
          
          <div className="bg-white/10 backdrop-blur-xl px-4 py-2 rounded-full border border-white/20 text-white font-mono text-sm shadow-xl">
            {formatTime(callDuration)}
          </div>
        </header>

        {/* Self View (PIP) */}
        <div className="absolute top-28 right-8 pointer-events-auto">
          <div className="w-32 h-44 bg-zinc-900 rounded-3xl overflow-hidden border border-white/20 shadow-2xl">
            {myVideoOn ? (
              <video ref={myVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-800 opacity-20">
                <Icon path={<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>} />
              </div>
            )}
          </div>
        </div>

        {/* Footer Controls */}
        <footer className="mt-auto flex justify-center gap-6 pb-12 pointer-events-auto">
          <button onClick={toggleAudio} className={`p-5 rounded-[2rem] transition-all shadow-lg ${myAudioOn ? "bg-white/10 text-white" : "bg-red-500 text-white"}`}>
            <Icon path={myAudioOn ? <><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v1a7 7 0 0 1-14 0v-1" /></> : <><line x1="1" y1="1" x2="23" y2="23" /><path d="M9 9v3a3 3 0 0 0 5.12 2.12" /></>} />
          </button>
          
          <button onClick={() => { socket.emit("endCall", { to: isAnswering ? incomingCall.from : id }); handleExit(); }} className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center rotate-[135deg] shadow-2xl shadow-red-600/40 hover:scale-105 active:scale-95 transition-transform">
            <Icon color="white" className="w-10 h-10" path={<path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-6.13-6.13 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />} />
          </button>

          <button onClick={toggleVideo} className={`p-5 rounded-[2rem] transition-all shadow-lg ${myVideoOn ? "bg-white/10 text-white" : "bg-red-500 text-white"}`}>
            <Icon path={myVideoOn ? <><path d="m22 8-6 4 6 4V8Z" /><rect width="14" height="12" x="2" y="6" rx="2" ry="2" /></> : <><line x1="1" y1="1" x2="23" y2="23" /><path d="M16 11.33L22 8v8l-2.67-1.78" /></>} />
          </button>
        </footer>
      </div>
    </div>
  );
};

export default VideoCallPage;