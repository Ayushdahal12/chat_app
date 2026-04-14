import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useSocketStore } from "../store/useSocketStore";
import { useMessageStore } from "../store/useMessageStore";
import { useAuthStore } from "../store/useAuthStore";
import axiosInstance from "../lib/axios";

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

const METERED_API_KEY = "2f6dd2408e5bd09a1b55e685412564098b23";
const METERED_URL = `https://guff-app.metered.live/api/v1/turn/credentials?apiKey=${METERED_API_KEY}`;

const VideoCallPage = () => {
  const { id } = useParams();
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

  // ✅ Guard — no id provided
  if (!id) {
    return (
      <div className="text-red-500 p-8">
        Invalid call: No user ID found.
      </div>
    );
  }

  // ✅ Fetch remote user info
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get("/users/suggested");
        if (!Array.isArray(res.data)) return;
        const user = res.data.find(u => u && u._id === id);
        if (user) {
          setRemoteUsername(user.username || "");
          setRemoteProfilePic(user.profilePic || "");
        }
      } catch (e) {
        console.error("Error fetching user:", e);
      }
    };
    fetchUser();
  }, [id]);

  // ✅ Main WebRTC setup
  useEffect(() => {
    if (!socket) {
      console.warn("Socket not available");
      return;
    }
    if (!authUser?._id) {
      console.warn("authUser missing");
      setStatus("User not authenticated");
      return;
    }

    const init = async () => {
      try {
        // ✅ Fetch TURN credentials from Metered
        const turnRes = await fetch(METERED_URL);
        const iceServers = await turnRes.json();
        console.log("✅ ICE Servers:", iceServers);

        // ✅ Get local media
        let stream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: "user",
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });
        } catch (mediaErr) {
          console.error("Media error:", mediaErr);
          setStatus("Camera/Mic Error");
          return;
        }

        streamRef.current = stream;
        if (myVideoRef.current) myVideoRef.current.srcObject = stream;

        // ✅ Create peer connection
        // Metered returns array directly — not { iceServers: [...] }
        const pc = new RTCPeerConnection({
          iceServers: Array.isArray(iceServers) ? iceServers : [],
          iceCandidatePoolSize: 10,
          bundlePolicy: "max-bundle",
          rtcpMuxPolicy: "require",
        });
        pcRef.current = pc;

        // ✅ Add local tracks
        stream.getTracks().forEach(track => {
          console.log("➕ Adding track:", track.kind);
          pc.addTrack(track, stream);
        });

        // ✅ Handle remote tracks
        let remoteStream = new MediaStream();
        pc.ontrack = (e) => {
          console.log("🎥 Remote track:", e.track.kind);
          remoteStream.addTrack(e.track);

          if (e.track.kind === "video") {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
            }
            setRemoteVideoOn(true);
            setStatus("Connected");
          }

          if (e.track.kind === "audio") {
            if (remoteAudioRef.current) {
              remoteAudioRef.current.srcObject = remoteStream;
              remoteAudioRef.current.volume = 1.0;
              remoteAudioRef.current.play().catch(() => {});
            }
          }
        };

        // ✅ ICE candidates
        pc.onicecandidate = (e) => {
          if (e.candidate) {
            const toId = isAnswering ? incomingCall?.from : id;
            if (toId) {
              socket.emit("iceCandidate", { to: toId, candidate: e.candidate });
            }
          }
        };

        // ✅ Connection state
        pc.oniceconnectionstatechange = () => {
          console.log("🧊 ICE:", pc.iceConnectionState);
          if (pc.iceConnectionState === "failed") pc.restartIce();
          if (pc.iceConnectionState === "disconnected") setStatus("Reconnecting...");
        };

        // ✅ Caller flow
        if (!isAnswering) {
          setStatus("Ringing...");
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("callUser", {
            to: id,
            signal: pc.localDescription,
            from: authUser._id,
            username: authUser.username,
          });
        } else {
          // ✅ Answerer flow
          if (incomingCall?.signal && incomingCall?.from) {
            await pc.setRemoteDescription(
              new RTCSessionDescription(incomingCall.signal)
            );
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit("answerCall", {
              to: incomingCall.from,
              signal: pc.localDescription,
            });
            clearIncomingCall();
            setStatus("Connected");
          }
        }
      } catch (err) {
        console.error("WebRTC Error:", err);
        setStatus("Connection Error");
      }
    };

    // ✅ Socket events
    socket.on("callAccepted", async (sdp) => {
      console.log("✅ Call accepted!");
      if (pcRef.current && sdp) {
        await pcRef.current.setRemoteDescription(
          new RTCSessionDescription(sdp)
        );
        setStatus("Connected");
      }
    });

    socket.on("iceCandidate", async ({ candidate }) => {
      try {
        if (pcRef.current && candidate) {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (e) {
        console.error("ICE error:", e);
      }
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

  // ✅ Timer
  useEffect(() => {
    let interval;
    if (status === "Connected") {
      interval = setInterval(() => {
        setCallDuration(prev => {
          durationRef.current = prev + 1;
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  // ✅ Format time
  const formatTime = (s) => {
    const mins = Math.floor(s / 60).toString().padStart(2, "0");
    const secs = (s % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  // ✅ Handle exit
  const handleExit = async () => {
    const finalTime = durationRef.current;
    const wasConnected = status === "Connected" || remoteVideoOn;
    try {
      await sendMessage(
        id,
        "Video Call",
        wasConnected ? "call_ended" : "call_missed",
        wasConnected ? finalTime : 0
      );
    } finally {
      navigate(`/chat/${id}`);
    }
  };

  // ✅ Toggle audio
  const toggleAudio = () => {
    const track = streamRef.current?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setMyAudioOn(track.enabled);
    }
  };

  // ✅ Toggle video
  const toggleVideo = () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setMyVideoOn(track.enabled);
    }
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col overflow-hidden w-full h-[100dvh] touch-none select-none">

      {/* ✅ Remote audio */}
      <audio
        ref={remoteAudioRef}
        autoPlay
        playsInline
        muted={false}
        style={{ display: "none" }}
      />

      {/* Remote video background */}
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
            <h2 className="text-white text-2xl font-bold tracking-tight">
              {remoteUsername}
            </h2>
            <p className="text-blue-400 text-sm mt-2 font-medium animate-pulse">
              {status}
            </p>
          </div>
        )}
      </div>

      {/* Top bar */}
      <div className="relative z-20 p-6 flex justify-between items-start pt-12 sm:pt-6">
        <div className="bg-black/30 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 text-white text-sm font-semibold">
          {remoteUsername || "Connecting..."}
        </div>
        <div className="bg-black/30 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 text-white font-mono text-sm">
          {formatTime(callDuration)}
        </div>
      </div>

      {/* Local PIP */}
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
              <span className="text-white/20 text-xs font-bold uppercase tracking-widest">
                Off
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="mt-auto relative z-40 flex justify-center items-center gap-6 pb-12 px-6">

        {/* Mute button */}
        <button
          onClick={toggleAudio}
          className={`p-4 rounded-3xl transition-all active:scale-90 ${
            myAudioOn ? "bg-white/10 backdrop-blur-md text-white" : "bg-red-500 text-white"
          }`}
        >
          <Icon
            path={
              myAudioOn ? (
                <>
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
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

        {/* End call button */}
        <button
          onClick={() => {
            const toId = isAnswering ? incomingCall?.from : id;
            if (toId) {
              socket?.emit("endCall", { to: toId });
            }
            handleExit();
          }}
          className="p-6 bg-red-600 rounded-[2.5rem] text-white shadow-lg shadow-red-600/40 hover:bg-red-700 transition-all active:scale-95"
        >
          <Icon
            path={
              <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-6.13-6.13 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
            }
            className="w-8 h-8 rotate-[135deg]"
          />
        </button>

        {/* Video toggle button */}
        <button
          onClick={toggleVideo}
          className={`p-4 rounded-3xl transition-all active:scale-90 ${
            myVideoOn ? "bg-white/10 backdrop-blur-md text-white" : "bg-red-500 text-white"
          }`}
        >
          <Icon
            path={
              myVideoOn ? (
                <>
                  <path d="m22 8-6 4 6 4V8Z" />
                  <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
                </>
              ) : (
                <>
                  <path d="m2 2 20 20" />
                  <path d="m16 12 6 4V8l-6 4Z" />
                  <path d="M7 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-1" />
                </>
              )
            }
          />
        </button>
      </div>
    </div>
  );
};

export default VideoCallPage;
