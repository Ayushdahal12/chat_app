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

// ✅ Your Metered API Key
const METERED_API_KEY = "2f6dd2408e5bd09a1b55e685412564098b23";
const METERED_URL = `https://guff-app.metered.live/api/v1/turn/credentials?apiKey=${METERED_API_KEY}`;

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

  const iceCandidatesQueue = useRef([]);
  const remoteStreamRef = useRef(null);
  const remotePeerIdRef = useRef(
    isAnswering ? (incomingCall?.from || id) : id
  );
  const incomingSignalRef = useRef(incomingCall?.signal || null);
  const remoteUsernameSnap = useRef(incomingCall?.username || "");

  // ✅ Ring sound for caller
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
    return () => {
      if (outgoingAudioRef.current) outgoingAudioRef.current.pause();
    };
  }, [isAnswering, callStarted]);

  // ✅ Fetch remote user info
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

  // ✅ Sync remote video when it turns on
  useEffect(() => {
    if (remoteVideoOn && remoteVideoRef.current && remoteStreamRef.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
    }
  }, [remoteVideoOn]);

  // ✅ Main socket + call logic
  useEffect(() => {
    if (!socket) return;

    const onCallAccepted = async (answerSdp) => {
      try {
        console.log("✅ callAccepted received!");
        const pc = pcRef.current;
        if (!pc) return;
        await pc.setRemoteDescription(new RTCSessionDescription(answerSdp));
        for (const c of iceCandidatesQueue.current) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(c));
          } catch (e) {}
        }
        iceCandidatesQueue.current = [];
        setCallStarted(true);
        setStatus("Connected");
        startTimer();
      } catch (e) {
        console.error("callAccepted error:", e);
      }
    };

    const onIceCandidate = async ({ candidate }) => {
      if (!pcRef.current || !candidate) return;
      try {
        if (pcRef.current.remoteDescription) {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          iceCandidatesQueue.current.push(candidate);
        }
      } catch (e) {}
    };

    const onCallEnded = () => {
      cleanup();
      navigate(`/chat/${id}`);
    };

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
      // ✅ STEP 1 — Fetch fresh TURN credentials from Metered
      console.log("🔄 Fetching TURN credentials from Metered...");
      const turnResponse = await fetch(METERED_URL);
      const iceServers = await turnResponse.json();
      console.log("✅ ICE Servers loaded:", iceServers);

      // ✅ STEP 2 — Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
        },
      });

      streamRef.current = stream;
      if (myVideoRef.current) myVideoRef.current.srcObject = stream;

      console.log("🎤 Audio tracks:", stream.getAudioTracks());
      console.log("🎥 Video tracks:", stream.getVideoTracks());

      // ✅ STEP 3 — Create peer connection with Metered TURN servers
      const pc = new RTCPeerConnection({
        iceServers: iceServers, // ← from Metered API
        iceCandidatePoolSize: 10,
        iceTransportPolicy: "all", // try direct first, fallback to TURN
        bundlePolicy: "max-bundle",
        rtcpMuxPolicy: "require",
      });

      pcRef.current = pc;

      // ✅ STEP 4 — Add all local tracks
      stream.getTracks().forEach((track) => {
        console.log("➕ Adding track:", track.kind);
        pc.addTrack(track, stream);
      });

      // ✅ STEP 5 — Handle remote tracks
      pc.ontrack = (event) => {
        console.log("🎥 Remote track received:", event.track.kind);
        const remoteStream = event.streams[0];
        remoteStreamRef.current = remoteStream;

        // ✅ Audio
        if (event.track.kind === "audio") {
          if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = remoteStream;
            remoteAudioRef.current.volume = 1.0;
            remoteAudioRef.current.play().catch((e) => {
              console.log("Audio play error:", e);
            });
          }
        }

        // ✅ Video
        if (event.track.kind === "video") {
          setRemoteVideoOn(true);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
            remoteVideoRef.current.play().catch(() => {});
          }
        }
      };

      // ✅ STEP 6 — Send ICE candidates to remote peer
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("🧊 Sending ICE candidate to:", remotePeerIdRef.current);
          socket.emit("iceCandidate", {
            to: remotePeerIdRef.current,
            candidate: event.candidate,
          });
        }
      };

      // ✅ STEP 7 — Monitor connection state
      pc.oniceconnectionstatechange = () => {
        console.log("🧊 ICE state:", pc.iceConnectionState);
        if (pc.iceConnectionState === "connected") {
          setStatus("Connected");
          setCallStarted(true);
          if (outgoingAudioRef.current) outgoingAudioRef.current.pause();
        }
        if (pc.iceConnectionState === "failed") {
          console.log("❌ ICE failed — restarting...");
          pc.restartIce();
        }
        if (pc.iceConnectionState === "disconnected") {
          setStatus("Reconnecting...");
        }
      };

      pc.onconnectionstatechange = () => {
        console.log("🔗 Connection state:", pc.connectionState);
      };

      // ✅ STEP 8 — Caller or Answerer flow
      if (!isAnswering) {
        // CALLER — create offer
        setStatus("Ringing...");
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        console.log("📞 Calling user:", id);
        socket.emit("callUser", {
          to: id,
          signal: pc.localDescription,
          from: authUser._id,
          username: authUser.username,
        });
      } else {
        // ANSWERER — create answer
        console.log("📲 Answering call from:", remotePeerIdRef.current);
        await pc.setRemoteDescription(
          new RTCSessionDescription(incomingSignalRef.current)
        );
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("answerCall", {
          to: remotePeerIdRef.current, // ← caller's USER ID
          signal: pc.localDescription,
        });
        setCallStarted(true);
        setStatus("Connected");
        startTimer();
        clearIncomingCall();
      }
    } catch (err) {
      console.error("❌ startCall error:", err);
      setStatus("Camera/Mic Error — Check Permissions");
    }
  };

  const startTimer = () => {
    timerRef.current = setInterval(
      () => setCallDuration((prev) => prev + 1),
      1000
    );
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

  return (
    <div className="fixed inset-0 bg-black flex flex-col overflow-hidden w-full h-[100dvh] touch-none select-none">

      {/* ✅ Remote audio — must NOT be muted */}
      <audio
        ref={remoteAudioRef}
        autoPlay
        playsInline
        muted={false}
        style={{ display: "none" }}
      />

      {/* REMOTE VIDEO BG */}
      <div className="absolute inset-0 z-0">
        {remoteVideoOn ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950">
            <div className="avatar mb-6">
              <div className="w-40 h-40 rounded-[3rem] ring-[12px] ring-white/5 border border-white/10 shadow-2xl">
                <img
                  src={
                    remoteProfilePic ||
                    `https://api.dicebear.com/7.x/thumbs/svg?seed=${remoteUsername}`
                  }
                  alt="user"
                />
              </div>
            </div>
            <h2 className="text-4xl font-black text-white">{remoteUsername}</h2>
            <p className="text-primary font-bold uppercase tracking-[0.3em] text-[10px] mt-2">
              {status}
            </p>
          </div>
        )}
      </div>

      {/* UI OVERLAY */}
      <div className="relative z-50 flex flex-col h-full pointer-events-none">

        {/* Header */}
        <header className="p-8 flex justify-between pointer-events-auto">
          <div className="bg-black/40 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-white text-[10px] font-black uppercase tracking-widest">
              {remoteUsername}
            </span>
          </div>
          {callStarted && (
            <div className="bg-white/10 backdrop-blur-xl px-4 py-2 rounded-full border border-white/20 text-white font-mono text-sm">
              {formatTime(callDuration)}
            </div>
          )}
        </header>

        {/* Self PIP */}
        <div className="absolute top-28 right-8 pointer-events-auto">
          <div className="w-32 h-48 md:w-44 md:h-64 bg-zinc-900 rounded-[2rem] overflow-hidden border border-white/20 shadow-2xl">
            {myVideoOn ? (
              <video
                ref={myVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Icon
                  color="#ffffff"
                  className="w-10 h-10 opacity-20"
                  path={
                    <>
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </>
                  }
                />
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <footer className="mt-auto pb-12 flex justify-center pointer-events-auto">
          <div className="flex items-center gap-6 bg-black/60 backdrop-blur-3xl p-6 rounded-[3.5rem] border border-white/10 shadow-2xl">

            {/* Audio toggle */}
            <button
              onClick={toggleAudio}
              className={`p-5 rounded-3xl transition-all ${
                myAudioOn ? "bg-white/5" : "bg-red-500/20"
              }`}
            >
              <Icon
                color={myAudioOn ? "#fff" : "#ef4444"}
                path={
                  myAudioOn ? (
                    <>
                      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                      <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
                      <line x1="12" x2="12" y1="19" y2="22" />
                    </>
                  ) : (
                    <>
                      <line x1="2" x2="22" y1="2" y2="22" />
                      <path d="M18.89 13.23A7.12 7.12 0 0 0 19 11v-1" />
                      <path d="M5 10v1a7 7 0 0 0 12 5" />
                      <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33" />
                      <path d="M9 9v3a3 3 0 0 0 5.12 2.12" />
                      <line x1="12" x2="12" y1="19" y2="22" />
                    </>
                  )
                }
              />
            </button>

            {/* End call */}
            <button
              onClick={endCall}
              className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all"
            >
              <Icon
                color="#fff"
                className="w-10 h-10 rotate-[135deg]"
                path={
                  <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-6.13-6.13 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
                }
              />
            </button>

            {/* Video toggle */}
            <button
              onClick={toggleVideo}
              className={`p-5 rounded-3xl transition-all ${
                myVideoOn ? "bg-white/5" : "bg-red-500/20"
              }`}
            >
              <Icon
                color={myVideoOn ? "#fff" : "#ef4444"}
                path={
                  myVideoOn ? (
                    <>
                      <path d="m22 8-6 4 6 4V8Z" />
                      <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
                    </>
                  ) : (
                    <>
                      <line x1="2" x2="22" y1="2" y2="22" />
                      <path d="M7 11V7c0-.55.45-1 1-1h4" />
                      <path d="M14 6h1c.55 0 1 .45 1 1v2.34" />
                      <path d="m22 8-3.5 2.33" />
                      <path d="M2 10v6c0 1.1.9 2 2 2h12c.5 0 .93-.18 1.25-.48" />
                      <path d="m22 16-1.5-1" />
                    </>
                  )
                }
              />
            </button>

          </div>
        </footer>
      </div>
    </div>
  );
};

export default VideoCallPage;
