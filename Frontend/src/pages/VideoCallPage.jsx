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

// ✅ Fallback TURN servers for maximum reliability
const FALLBACK_TURN_SERVERS = [
  { urls: "turn:openrelay.metered.ca:80", username: "openrelayproject", credential: "openrelayproject" },
  { urls: "turn:openrelay.metered.ca:443", username: "openrelayproject", credential: "openrelayproject" },
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
  { urls: "stun:stun3.l.google.com:19302" },
];

// ✅ Fetch TURN credentials with fallback
const fetchTurnServers = async () => {
  try {
    console.log("🔄 Fetching primary TURN credentials...");
    const turnRes = await fetch(METERED_URL, { timeout: 5000 });
    if (!turnRes.ok) throw new Error("Primary TURN fetch failed");
    const iceServersResp = await turnRes.json();
    const primaryServers = Array.isArray(iceServersResp) ? iceServersResp : iceServersResp.iceServers || [];
    console.log("✅ Primary TURN servers:", primaryServers.length);
    return [...primaryServers, ...FALLBACK_TURN_SERVERS];
  } catch (err) {
    console.warn("⚠️  Primary TURN failed, using fallback servers:", err.message);
    return FALLBACK_TURN_SERVERS;
  }
};

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
  const pcRef = useRef(null);
  const durationRef = useRef(0);
  const iceCandidatesQueue = useRef([]);
  // ✅ FIXED — use useRef for remoteStream
  const remoteStreamRef = useRef(new MediaStream());
  const ringAudioRef = useRef(null);

  // ✅ Sync duration ref
  useEffect(() => { durationRef.current = callDuration; }, [callDuration]);

  // ✅ Ring sound for caller only
  useEffect(() => {
    if (!isAnswering && !callStarted) {
      const audio = new Audio(ringSound);
      audio.loop = true;
      ringAudioRef.current = audio;
      audio.play().catch(() => { });
    }
    return () => {
      if (ringAudioRef.current) {
        ringAudioRef.current.pause();
        ringAudioRef.current = null;
      }
    };
  }, []);




  // ✅ Stop ring when call starts
  useEffect(() => {
    if (callStarted && ringAudioRef.current) {
      ringAudioRef.current.pause();
      ringAudioRef.current = null;
    }
  }, [callStarted]);

  // ✅ Timer
  useEffect(() => {
    let interval;
    if (callStarted) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStarted]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
      // ✅ Add delay for video buffer before playing (4-5 seconds)
      const playTimeout = setTimeout(() => {
        console.log("▶️ Attempting to play remote video after delay");
        remoteVideoRef.current?.play().catch((err) => {
          console.error("❌ Failed to play remote video:", err);
        });
      }, 4500);
      
      return () => clearTimeout(playTimeout);
    }
  }, [remoteVideoOn]);

  // ✅ Fetch remote user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get("/users/suggested");
        const user = Array.isArray(res.data)
          ? res.data.find(u => u._id === id)
          : null;
        if (user) {
          setRemoteUsername(user.username || "");
          setRemoteProfilePic(user.profilePic || "");
        }
      } catch (e) { console.error(e); }
    };
    if (id) fetchUser();
  }, [id]);

  // ✅ Main WebRTC logic
  useEffect(() => {
    if (!socket || !authUser?._id) return;

    const init = async () => {
      try {
        // ✅ Fetch TURN credentials with fallback
        const iceServers = await fetchTurnServers();

        // ✅ Get media with optimized constraints
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: "user",
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
            frameRate: { ideal: 24, max: 30 }
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            latency: { ideal: 40 }
          },
        });
        streamRef.current = stream;
        if (myVideoRef.current) myVideoRef.current.srcObject = stream;
        console.log("🎤 Audio tracks:", stream.getAudioTracks().length);
        console.log("🎥 Video tracks:", stream.getVideoTracks().length);

        // ✅ Create peer connection with optimized settings
        const pc = new RTCPeerConnection({
          iceServers: iceServers,
          iceCandidatePoolSize: 100,  // ✅ Much larger pool for cross-network
          bundlePolicy: "max-bundle",
          rtcpMuxPolicy: "require",
          iceTransportPolicy: "all",  // ✅ Try all candidates (host, srflx, relay)
          iceGatheringTimeout: 10000,  // ✅ Give more time for ICE gathering
          enableRtpDataChannels: false,
        });
        pcRef.current = pc;

        // ✅ Add local tracks
        stream.getTracks().forEach(track => {
          console.log("➕ Adding local track:", track.kind);
          pc.addTrack(track, stream);
        });

        // ✅ Optimize codec preferences
        if (RTCRtpSender.getCapabilities) {
          const videoCapabilities = RTCRtpSender.getCapabilities('video')?.codecs || [];
          const audioCapabilities = RTCRtpSender.getCapabilities('audio')?.codecs || [];
          
          // Prefer VP9 > VP8 > H264 for video
          const videoCodecs = videoCapabilities.filter(c => 
            c.mimeType.includes('video/') && !c.mimeType.includes('rtx')
          ).sort((a, b) => {
            const priority = { 'vp9': 0, 'vp8': 1, 'h264': 2 };
            return (priority[a.mimeType.split('/')[1].split('-')[0].toLowerCase()] || 999) -
                   (priority[b.mimeType.split('/')[1].split('-')[0].toLowerCase()] || 999);
          });
          
          console.log("🎥 Available video codecs:", videoCodecs.map(c => c.mimeType));
        }

        // ✅ Handle remote tracks
        pc.ontrack = (event) => {
          console.log("🎥 Track received:", event.track.kind);

          // Avoid duplicate tracks
          const existingTracks = remoteStreamRef.current.getTracks();
          const alreadyAdded = existingTracks.find(t => t.id === event.track.id);

          if (!alreadyAdded) {
            remoteStreamRef.current.addTrack(event.track);
          }

          // ✅ Attach remote stream to BOTH video and audio elements
          if (remoteVideoRef.current && !remoteVideoRef.current.srcObject) {
            remoteVideoRef.current.srcObject = remoteStreamRef.current;
            console.log("📺 Remote video attached");
          }
          
          if (remoteAudioRef.current && !remoteAudioRef.current.srcObject) {
            remoteAudioRef.current.srcObject = remoteStreamRef.current;
            console.log("🔊 Remote audio attached");
          }

          if (event.track.kind === "video") {
            // ✅ Wait 4-5 seconds for video to buffer and stabilize before showing
            setTimeout(() => {
              console.log("🎥 Showing remote video after buffer delay");
              setRemoteVideoOn(true);
            }, 4500);
          }
        };

        // ✅ ICE candidates
        pc.onicecandidate = (e) => {
          if (e.candidate) {
            const toId = isAnswering ? incomingCall?.from : id;
            if (toId) {
              console.log("🧊 Sending ICE to:", toId);
              socket.emit("iceCandidate", { to: toId, candidate: e.candidate });
            }
          }
        };

        // ✅ Connection state logging
        let disconnectTimeout = null;
        pc.oniceconnectionstatechange = () => {
          console.log("🧊 ICE state:", pc.iceConnectionState);
          if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
            setStatus("Connected");
            setCallStarted(true);
            // Clear any pending disconnect timeout
            if (disconnectTimeout) clearTimeout(disconnectTimeout);
          }
          if (pc.iceConnectionState === "failed") {
            console.log("❌ ICE failed — restarting");
            if (disconnectTimeout) clearTimeout(disconnectTimeout);
            pc.restartIce();
            setStatus("Reconnecting...");
          }
          if (pc.iceConnectionState === "disconnected") {
            setStatus("Reconnecting...");
            // ✅ Wait 8-10 seconds before restarting ICE (long timeout to avoid false disconnects)
            if (disconnectTimeout) clearTimeout(disconnectTimeout);
            disconnectTimeout = setTimeout(() => {
              if (pcRef.current?.iceConnectionState === "disconnected") {
                console.log("⚠️ Restarting ICE due to prolonged disconnection (8+ seconds)");
                pc.restartIce();
              }
            }, 8000);
          }
        };

        pc.onconnectionstatechange = () => {
          console.log("🔗 Connection:", pc.connectionState);
          if (pc.connectionState === "failed") {
            console.log("❌ Connection failed — attempting restart");
            pc.restartIce();
          }
        };

        // ✅ Caller — send offer
        if (!isAnswering) {
          setStatus("Ringing...");
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          console.log("📞 Calling:", id);
          socket.emit("callUser", {
            to: id,
            signal: pc.localDescription,
            from: authUser._id,
            username: authUser.username,
          });
        } else {
          // ✅ Answerer — send answer
          if (incomingCall?.signal && incomingCall?.from) {
            console.log("📲 Answering from:", incomingCall.from);
            await pc.setRemoteDescription(
              new RTCSessionDescription(incomingCall.signal)
            );
            // ✅ Flush queued ICE candidates
            for (const c of iceCandidatesQueue.current) {
              try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch (e) { }
            }
            iceCandidatesQueue.current = [];
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit("answerCall", {
              to: incomingCall.from,
              signal: pc.localDescription,
            });
            clearIncomingCall();
            setCallStarted(true);
            setStatus("Connected");
          }
        }
      } catch (err) {
        console.error("❌ WebRTC Error:", err);
        setStatus("Connection Error");
      }
    };

    // ✅ callAccepted — caller gets answer from receiver
    socket.on("callAccepted", async (sdp) => {
      console.log("✅ callAccepted received!");
      try {
        if (pcRef.current && sdp) {
          await pcRef.current.setRemoteDescription(
            new RTCSessionDescription(sdp)
          );
          // ✅ Flush queued ICE candidates
          for (const c of iceCandidatesQueue.current) {
            try { await pcRef.current.addIceCandidate(new RTCIceCandidate(c)); } catch (e) { }
          }
          iceCandidatesQueue.current = [];
          setCallStarted(true);
          setStatus("Connected");
        }
      } catch (e) { console.error("callAccepted error:", e); }
    });

    // ✅ ICE candidate from remote
    socket.on("iceCandidate", async ({ candidate }) => {
      try {
        if (!pcRef.current || !candidate) return;
        if (pcRef.current.remoteDescription) {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          // Queue if remote description not set yet
          iceCandidatesQueue.current.push(candidate);
        }
      } catch (e) { console.error("ICE error:", e); }
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
  }, [socket]);

  const handleExit = async () => {
    const finalTime = durationRef.current;
    try {
      await axiosInstance.post(`/messages/send/${id}`, {
        text: "Video Call",
        type: finalTime > 0 ? "call_ended" : "call_missed",
        callDuration: finalTime,
      });
    } catch (e) { console.log(e); }
    finally { navigate(`/chat/${id}`); }
  };

  const toggleVideo = () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (track) { track.enabled = !track.enabled; setMyVideoOn(track.enabled); }
  };

  const toggleAudio = () => {
    const track = streamRef.current?.getAudioTracks()[0];
    if (track) { track.enabled = !track.enabled; setMyAudioOn(track.enabled); }
  };

  const formatTime = (s) => {
    const mins = Math.floor(s / 60).toString().padStart(2, "0");
    const secs = (s % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col w-full h-[100dvh]">

      {/* ✅ Remote audio — must NOT be muted */}
      <audio ref={remoteAudioRef} autoPlay playsInline muted={false} style={{ display: "none" }} />

      {/* Remote video */}
      <div className="absolute inset-0">
        {remoteVideoOn && remoteVideoRef.current?.srcObject?.getVideoTracks().length > 0 ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            muted={false}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900">
            <div className="relative mb-4">
              <img
                src={remoteProfilePic || `https://api.dicebear.com/7.x/thumbs/svg?seed=${remoteUsername}`}
                className="w-32 h-32 rounded-full border-4 border-white/10 object-cover"
                alt=""
              />
              {!callStarted && (
                <div className="absolute inset-0 rounded-full border-4 border-blue-500/40 animate-ping" />
              )}
            </div>
            <h2 className="text-white text-2xl font-bold">{remoteUsername}</h2>
            <p className="text-blue-400 text-sm mt-2 animate-pulse">{status}</p>
          </div>
        )}
      </div>

      {/* Top bar */}
      <div className="relative z-10 p-6 flex justify-between items-start pointer-events-none">
        <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full text-white text-xs font-bold pointer-events-auto">
          {remoteUsername || "Connecting..."}
        </div>
        {callStarted && (
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white font-mono pointer-events-auto">
            {formatTime(callDuration)}
          </div>
        )}
      </div>

      {/* Local PIP */}
      <div className="absolute top-24 right-6 z-20">
        <div className="w-28 h-40 bg-black rounded-2xl overflow-hidden border border-white/20 shadow-xl">
          {myVideoOn ? (
            <video ref={myVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-800">
              <span className="text-white/20 text-xs font-bold uppercase">Off</span>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="mt-auto relative z-30 flex justify-center gap-8 pb-12">

        {/* Mute */}
        <button
          onClick={toggleAudio}
          className={`p-5 rounded-full transition-all active:scale-90 ${myAudioOn ? "bg-white/10" : "bg-red-500"} text-white`}
        >
          <Icon path={
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
          } />
        </button>

        {/* End call */}
        <button
          onClick={() => {
            const toId = isAnswering ? incomingCall?.from : id;
            if (toId) socket?.emit("endCall", { to: toId });
            handleExit();
          }}
          className="p-6 bg-red-600 rounded-full text-white shadow-lg shadow-red-600/40 active:scale-95 transition-all"
        >
          <Icon
            className="w-8 h-8 rotate-[135deg]"
            path={<path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-6.13-6.13 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />}
          />
        </button>

        {/* Video toggle */}
        <button
          onClick={toggleVideo}
          className={`p-5 rounded-full transition-all active:scale-90 ${myVideoOn ? "bg-white/10" : "bg-red-500"} text-white`}
        >
          <Icon path={
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
          } />
        </button>

      </div>
    </div>
  );
};

export default VideoCallPage;
