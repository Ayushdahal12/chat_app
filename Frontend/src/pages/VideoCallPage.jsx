import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useSocketStore } from "../store/useSocketStore";
import { useAuthStore } from "../store/useAuthStore";
import axiosInstance from "../lib/axios";
import ringSound from "../assets/Ring.mp3";

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

const VideoCallPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isAnswering = searchParams.get("answer") === "true";
  const navigate = useNavigate();
  const { socket, incomingCall, clearIncomingCall } = useSocketStore();
  const { authUser } = useAuthStore();

  const [callDuration, setCallDuration] = useState(0);
  const [callStarted, setCallStarted] = useState(false);
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
  const timerRef = useRef(null);
  const pcRef = useRef(null);
  const outgoingAudioRef = useRef(null);

  const callDurationRef = useRef(0);
  const iceCandidatesQueue = useRef([]);
  const remoteStreamRef = useRef(null);
  const remotePeerIdRef = useRef(isAnswering ? (incomingCall?.from || id) : id);
  const incomingSignalRef = useRef(incomingCall?.signal || null);
  const remoteUsernameSnap = useRef(incomingCall?.username || "");

  useEffect(() => {
    if (!isAnswering && !callStarted) {
      const audio = new Audio(ringSound);
      audio.loop = true;
      outgoingAudioRef.current = audio;
      audio.play().catch(() => {});
    }
    if (callStarted && outgoingAudioRef.current) {
      outgoingAudioRef.current.pause();
    }
    return () => { if (outgoingAudioRef.current) outgoingAudioRef.current.pause(); };
  }, [isAnswering, callStarted]);

  useEffect(() => {
    if (isAnswering) {
      setRemoteUsername(remoteUsernameSnap.current);
    } else {
      axiosInstance.get("/users/suggested").then((res) => {
        const users = Array.isArray(res.data) ? res.data : [];
        const user = users.find((u) => u._id === id);
        if (user) {
          setRemoteUsername(user.username);
          setRemoteProfilePic(user.profilePic || "");
        }
      });
    }
  }, [id, isAnswering]);

  useEffect(() => {
    if (remoteVideoOn && remoteVideoRef.current && remoteStreamRef.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
    }
  }, [remoteVideoOn]);

  useEffect(() => {
    if (!socket) return;

    const onCallAccepted = async (answerSdp) => {
      try {
        const pc = pcRef.current;
        if (!pc) return;
        await pc.setRemoteDescription(new RTCSessionDescription(answerSdp));
        for (const c of iceCandidatesQueue.current) {
          try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch (e) {}
        }
        iceCandidatesQueue.current = [];
        setCallStarted(true);
        setStatus("Connected");
        startTimer();
      } catch (e) { console.error(e); }
    };

    const onIceCandidate = async ({ candidate }) => {
      if (!pcRef.current) return;
      try {
        if (pcRef.current.remoteDescription) {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          iceCandidatesQueue.current.push(candidate);
        }
      } catch (e) {}
    };

    const onCallEnded = () => { cleanup(); navigate(`/chat/${id}`); };

    socket.on("callAccepted", onCallAccepted);
    socket.on("iceCandidate", onIceCandidate);
    socket.on("callEnded", onCallEnded);

    startCall();

    return () => {
      socket.off("callAccepted", onCallAccepted);
      socket.off("iceCandidate", onIceCandidate);
      socket.off("callEnded", onCallEnded);
      cleanup();
    };
  }, [socket]);

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;
      if (myVideoRef.current) myVideoRef.current.srcObject = stream;

      // ✅ ONLY FIX — Added TURN servers
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          {
            urls: "turn:openrelay.metered.ca:80",
            username: "openrelayproject",
            credential: "openrelayproject",
          },
          {
            urls: "turn:openrelay.metered.ca:443",
            username: "openrelayproject",
            credential: "openrelayproject",
          },
          {
            urls: "turn:openrelay.metered.ca:443?transport=tcp",
            username: "openrelayproject",
            credential: "openrelayproject",
          },
        ],
        iceCandidatePoolSize: 10,
      });
      pcRef.current = pc;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        remoteStreamRef.current = event.streams[0];
        if (remoteAudioRef.current) remoteAudioRef.current.srcObject = event.streams[0];
        if (event.track.kind === "video") setRemoteVideoOn(true);
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("iceCandidate", { to: remotePeerIdRef.current, candidate: event.candidate });
        }
      };

      if (!isAnswering) {
        setStatus("Ringing...");
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("callUser", { to: id, signal: pc.localDescription, from: authUser._id, username: authUser.username });
      } else {
        await pc.setRemoteDescription(new RTCSessionDescription(incomingSignalRef.current));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("answerCall", { to: remotePeerIdRef.current, signal: pc.localDescription });
        setCallStarted(true);
        setStatus("Connected");
        startTimer();
        clearIncomingCall();
      }
    } catch (err) { setStatus("Hardware Error"); }
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => setCallDuration((prev) => prev + 1), 1000);
  };

  const formatTime = (s) => {
    const mins = Math.floor(s / 60).toString().padStart(2, "0");
    const secs = (s % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const cleanup = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    pcRef.current?.close();
    clearInterval(timerRef.current);
    if (outgoingAudioRef.current) outgoingAudioRef.current.pause();
  };

  const endCall = () => {
    socket?.emit("endCall", { to: remotePeerIdRef.current });
    cleanup();
    navigate(`/chat/${id}`);
  };

  const toggleVideo = () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (track) { track.enabled = !track.enabled; setMyVideoOn(track.enabled); }
  };

  const toggleAudio = () => {
    const track = streamRef.current?.getAudioTracks()[0];
    if (track) { track.enabled = !track.enabled; setMyAudioOn(track.enabled); }
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col overflow-hidden w-full h-[100dvh] touch-none select-none">
      <audio ref={remoteAudioRef} autoPlay playsInline style={{ display: "none" }} />

      {/* REMOTE VIDEO BG */}
      <div className="absolute inset-0 z-0">
        {remoteVideoOn ? (
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950">
            <div className="avatar mb-6">
              <div className="w-40 h-40 rounded-[3rem] ring-[12px] ring-white/5 border border-white/10 shadow-2xl">
                <img src={remoteProfilePic || `https://api.dicebear.com/7.x/thumbs/svg?seed=${remoteUsername}`} alt="user" />
              </div>
            </div>
            <h2 className="text-4xl font-black text-white">{remoteUsername}</h2>
            <p className="text-primary font-bold uppercase tracking-[0.3em] text-[10px] mt-2">{status}</p>
          </div>
        )}
      </div>

      {/* UI OVERLAY */}
      <div className="relative z-50 flex flex-col h-full pointer-events-none">
        <header className="p-8 flex justify-between pointer-events-auto">
          <div className="bg-black/40 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-white text-[10px] font-black uppercase tracking-widest">{remoteUsername}</span>
          </div>
          {callStarted && (
            <div className="bg-white/10 backdrop-blur-xl px-4 py-2 rounded-full border border-white/20 text-white font-mono text-sm">
              {formatTime(callDuration)}
            </div>
          )}
        </header>

        {/* SELF PIP */}
        <div className="absolute top-28 right-8 pointer-events-auto">
          <div className="w-32 h-48 md:w-44 md:h-64 bg-zinc-900 rounded-[2rem] overflow-hidden border border-white/20 shadow-2xl">
            {myVideoOn ? (
              <video ref={myVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Icon color="#ffffff" className="w-10 h-10 opacity-20" path={<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>} />
              </div>
            )}
          </div>
        </div>

        {/* CONTROLS */}
        <footer className="mt-auto pb-12 flex justify-center pointer-events-auto">
          <div className="flex items-center gap-6 bg-black/60 backdrop-blur-3xl p-6 rounded-[3.5rem] border border-white/10 shadow-2xl">
            <button onClick={toggleAudio} className={`p-5 rounded-3xl transition-all ${myAudioOn ? 'bg-white/5' : 'bg-red-500/20'}`}>
              <Icon color={myAudioOn ? "#fff" : "#ef4444"} path={myAudioOn ? <><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><line x1="12" x2="12" y1="19" y2="22"/></> : <><line x1="2" x2="22" y1="2" y2="22"/><path d="M18.89 13.23A7.12 7.12 0 0 0 19 11v-1"/><path d="M5 10v1a7 7 0 0 0 12 5"/><path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12"/><line x1="12" x2="12" y1="19" y2="22"/></>} />
            </button>

            <button onClick={endCall} className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all">
              <Icon color="#fff" className="w-10 h-10 rotate-[135deg]" path={<path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-6.13-6.13 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/>} />
            </button>

            <button onClick={toggleVideo} className={`p-5 rounded-3xl transition-all ${myVideoOn ? 'bg-white/5' : 'bg-red-500/20'}`}>
              <Icon color={myVideoOn ? "#fff" : "#ef4444"} path={myVideoOn ? <><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></> : <><line x1="2" x2="22" y1="2" y2="22"/><path d="M7 11V7c0-.55.45-1 1-1h4"/><path d="M14 6h1c.55 0 1 .45 1 1v2.34"/><path d="m22 8-3.5 2.33"/><path d="M2 10v6c0 1.1.9 2 2 2h12c.5 0 .93-.18 1.25-.48"/><path d="m22 16-1.5-1"/></>} />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default VideoCallPage;