import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useSocketStore } from "../store/useSocketStore";
import { useMessageStore } from "../store/useMessageStore";
import { useAuthStore } from "../store/useAuthStore";
import axiosInstance from "../lib/axios";

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
  const streamRef = useRef(null);
  const pcRef = useRef(null);
  const durationRef = useRef(0);
  const iceQueue = useRef([]); // Critical for holding network info until ready

  if (!id) return <div className="text-red-500 p-8">Invalid Call</div>;

  const handleExit = async () => {
    const finalTime = durationRef.current;
    const wasConnected = status === "Connected";
    try {
      await sendMessage(id, "Video Call", wasConnected ? "call_ended" : "call_missed", wasConnected ? finalTime : 0);
    } finally {
      navigate(`/chat/${id}`);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get("/users/suggested");
        const user = res.data.find((u) => u._id === id);
        if (user) {
          setRemoteUsername(user.username || "");
          setRemoteProfilePic(user.profilePic || "");
        }
      } catch (err) { console.error(err); }
    };
    fetchUser();
  }, [id]);

  useEffect(() => {
    if (!socket || !authUser) return;

    const init = async () => {
      try {
        const turnRes = await fetch(METERED_URL);
        const iceServersResp = await turnRes.json();
        const iceServers = Array.isArray(iceServersResp) ? iceServersResp : iceServersResp.iceServers || [];

        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (myVideoRef.current) myVideoRef.current.srcObject = stream;

        const pc = new RTCPeerConnection({ iceServers });
        pcRef.current = pc;

        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        pc.ontrack = (e) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = e.streams[0];
            setRemoteVideoOn(true);
            setStatus("Connected");
          }
        };

        pc.onicecandidate = (e) => {
          if (e.candidate) {
            const toId = isAnswering ? incomingCall?.from : id;
            socket.emit("iceCandidate", { to: toId, candidate: e.candidate });
          }
        };

        if (!isAnswering) {
          setStatus("Ringing...");
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("callUser", { to: id, signal: offer, from: authUser._id, username: authUser.username });
        } else if (incomingCall?.signal) {
          await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.signal));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit("answerCall", { to: incomingCall.from, signal: answer });

          // Process early ICE candidates
          iceQueue.current.forEach((cand) => pc.addIceCandidate(new RTCIceCandidate(cand)));
          iceQueue.current = [];
          clearIncomingCall();
        }

        socket.on("callAccepted", async (sdp) => {
          if (pc.signalingState !== "stable") {
            await pc.setRemoteDescription(new RTCSessionDescription(sdp));
            iceQueue.current.forEach((cand) => pc.addIceCandidate(new RTCIceCandidate(cand)));
            iceQueue.current = [];
            setStatus("Connected");
          }
        });

        socket.on("iceCandidate", async ({ candidate }) => {
          if (pc.remoteDescription) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } else {
            iceQueue.current.push(candidate);
          }
        });

        socket.on("callEnded", handleExit);
      } catch (err) {
        console.error("WebRTC error:", err);
        setStatus("Error");
      }
    };

    init();

    return () => {
      socket.off("callAccepted");
      socket.off("iceCandidate");
      socket.off("callEnded");
      streamRef.current?.getTracks().forEach((t) => t.stop());
      pcRef.current?.close();
    };
  }, [socket]); // Don't restart on every re-render

  useEffect(() => {
    let interval;
    if (status === "Connected") {
      interval = setInterval(() => {
        setCallDuration((prev) => {
          durationRef.current = prev + 1;
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  return (
    <div className="fixed inset-0 bg-zinc-950 flex flex-col overflow-hidden">
      {/* Remote Video (Full Screen) */}
      {remoteVideoOn ? (
        <video ref={remoteVideoRef} autoPlay playsInline className="absolute w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 text-white">
          <img src={remoteProfilePic || `https://api.dicebear.com/7.x/thumbs/svg?seed=${remoteUsername}`} className="w-32 h-32 rounded-full mb-4 border-2 border-white/10" />
          <h2 className="text-2xl font-bold">{remoteUsername}</h2>
          <p className="text-blue-400 animate-pulse mt-2">{status}</p>
        </div>
      )}

      {/* Local PIP (Top Right) */}
      <div className="absolute top-6 right-6 w-28 h-40 sm:w-36 sm:h-52 bg-black rounded-2xl overflow-hidden border border-white/20 shadow-2xl z-20">
        <video ref={myVideoRef} autoPlay muted playsInline className={`w-full h-full object-cover scale-x-[-1] ${!myVideoOn ? 'hidden' : ''}`} />
        {!myVideoOn && <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">Video Off</div>}
      </div>

      <div className="relative z-10 p-6 flex justify-between items-start pt-14">
        <div className="bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full text-white text-xs font-semibold">{remoteUsername}</div>
        <div className="bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full text-white font-mono text-xs">
          {Math.floor(callDuration / 60)}:{(callDuration % 60).toString().padStart(2, '0')}
        </div>
      </div>

      {/* Controls */}
      <div className="mt-auto flex justify-center items-center gap-8 pb-14 z-30">
        <button onClick={() => {
          const t = streamRef.current?.getAudioTracks()[0];
          if(t) { t.enabled = !t.enabled; setMyAudioOn(t.enabled); }
        }} className={`p-5 rounded-full transition-all ${myAudioOn ? 'bg-white/10' : 'bg-red-500'} text-white`}>
          {myAudioOn ? "🎤" : "🔇"}
        </button>

        <button onClick={() => { 
          const toId = isAnswering ? incomingCall?.from : id;
          if (toId) socket.emit("endCall", { to: toId });
          handleExit();
        }} className="p-6 bg-red-600 rounded-3xl text-white shadow-lg shadow-red-600/30 active:scale-90 transition-transform">
          <span className="text-2xl">📞</span>
        </button>

        <button onClick={() => {
          const t = streamRef.current?.getVideoTracks()[0];
          if(t) { t.enabled = !t.enabled; setMyVideoOn(t.enabled); }
        }} className={`p-5 rounded-full transition-all ${myVideoOn ? 'bg-white/10' : 'bg-red-500'} text-white`}>
          {myVideoOn ? "📹" : "🚫"}
        </button>
      </div>
    </div>
  );
};

export default VideoCallPage;