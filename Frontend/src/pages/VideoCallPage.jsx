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
  const remoteStream = new MediaStream();


  // Sync duration for the backend log
  useEffect(() => { durationRef.current = callDuration; }, [callDuration]);

  // ✅ TIMER LOGIC: Starts only when remote video is actually detected
  useEffect(() => {
    let interval;
    if (remoteVideoOn) {
      setCallStarted(true);
      setStatus("Connected");
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [remoteVideoOn]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get("/users/suggested");
        const user = res.data.find(u => u._id === id);
        if (user) {
          setRemoteUsername(user.username);
          setRemoteProfilePic(user.profilePic);
        }
      } catch (e) { console.error(e); }
    };
    fetchUser();
  }, [id]);

  useEffect(() => {
    if (!socket) return;

    const init = async () => {
      try {
        const turnRes = await fetch(METERED_URL);
        const iceServers = await turnRes.json();

        // 1. Media First
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (myVideoRef.current) myVideoRef.current.srcObject = stream;

        // 2. PC Setup
        const pc = new RTCPeerConnection({ iceServers });
        pcRef.current = pc;

        // 3. Add tracks immediately
        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        // 4. Handle Remote Stream
        pc.ontrack = (event) => {
          console.log("🎥 Track received:", event.track.kind);

          // ✅ Add track manually (FIX FOR PC ISSUE)
          remoteStreamRef.current.addTrack(event.track);

          // ✅ Attach ONE stable stream
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStreamRef.current;
          }

          // ✅ Detect video
          if (event.track.kind === "video") {
            setRemoteVideoOn(true);
          }
        };

        pc.onconnectionstatechange = () => {
          console.log("🔗 Connection state:", pc.connectionState);
          if (pc.connectionState === "connected") {
            setStatus("Connected");
            setCallStarted(true);
          }
        };

        pc.onicecandidate = (e) => {
          if (e.candidate) socket.emit("iceCandidate", { to: isAnswering ? incomingCall.from : id, candidate: e.candidate });
        };

        // 5. Signaling
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
      } catch (err) { setStatus("Media Error"); }
    };

    socket.on("callAccepted", async (sdp) => {
      await pcRef.current?.setRemoteDescription(new RTCSessionDescription(sdp));
      iceCandidatesQueue.current.forEach(c => pcRef.current.addIceCandidate(new RTCIceCandidate(c)));
      iceCandidatesQueue.current = [];
    });

    socket.on("iceCandidate", async ({ candidate }) => {
      if (pcRef.current?.remoteDescription) await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      else iceCandidatesQueue.current.push(candidate);
    });

    socket.on("callEnded", () => handleExit());
    init();

    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      pcRef.current?.close();
    };
  }, [socket]);

  const handleExit = async () => {
    const finalTime = durationRef.current;
    try {
      // ✅ This sends the time to your ChatPage log
      await axiosInstance.post(`/messages/send/${id}`, {
        text: "Video Call",
        type: finalTime > 0 ? "call_ended" : "call_missed",
        callDuration: finalTime
      });
    } finally {
      navigate(`/chat/${id}`);
    }
  };

  const toggleVideo = () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setMyVideoOn(track.enabled);
      if (myVideoRef.current) myVideoRef.current.srcObject = streamRef.current;
    }
  };

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col w-full h-[100dvh]">
      <audio ref={remoteAudioRef} autoPlay playsInline />

      {/* Remote Video Container */}
      <div className="absolute inset-0">
        {remoteVideoOn ? (
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900">
            <img src={remoteProfilePic || `https://api.dicebear.com/7.x/thumbs/svg?seed=${remoteUsername}`} className="w-32 h-32 rounded-full mb-4 border-2 border-white/10" alt="" />
            <h2 className="text-white text-xl font-bold">{remoteUsername}</h2>
            <p className="text-blue-400 text-sm animate-pulse">{status}</p>
          </div>
        )}
      </div>

      {/* Top Header */}
      <div className="relative z-10 p-6 flex justify-between items-start pointer-events-none">
        <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full text-white text-xs font-bold pointer-events-auto">
          {remoteUsername}
        </div>
        <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white font-mono pointer-events-auto">
          {formatTime(callDuration)}
        </div>
      </div>

      {/* Local PIP */}
      <div className="absolute top-24 right-6 z-20">
        <div className="w-28 h-40 bg-black rounded-2xl overflow-hidden border border-white/20 shadow-xl">
          {myVideoOn ? (
            <video ref={myVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-white/20">Video Off</div>
          )}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="mt-auto relative z-30 flex justify-center gap-8 pb-12">
        <button onClick={() => {
          const t = streamRef.current?.getAudioTracks()[0];
          if (t) { t.enabled = !t.enabled; setMyAudioOn(t.enabled); }
        }} className={`p-5 rounded-full ${myAudioOn ? 'bg-white/10' : 'bg-red-500'} text-white`}>
          <Icon path={myAudioOn ? <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /> : <path d="M1 1l22 22" />} />
        </button>

        <button onClick={() => { socket.emit("endCall", { to: isAnswering ? incomingCall.from : id }); handleExit(); }} className="p-6 bg-red-600 rounded-full text-white rotate-[135deg] scale-125">
          <Icon path={<path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-6.13-6.13 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />} />
        </button>

        <button onClick={toggleVideo} className={`p-5 rounded-full ${myVideoOn ? 'bg-white/10' : 'bg-red-500'} text-white`}>
          <Icon path={<><path d="m22 8-6 4 6 4V8Z" /><rect width="14" height="12" x="2" y="6" rx="2" ry="2" /></>} />
        </button>
      </div>
    </div>
  );
};

export default VideoCallPage;