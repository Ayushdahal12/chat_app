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

const METERED_API_KEY = "YOUR_API_KEY";
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
  const remoteStream = useRef(new MediaStream());

  if (!id) {
    return <div className="text-red-500 p-8">Invalid call</div>;
  }

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

  useEffect(() => {
    if (!socket) return;

    // ✅ FIXED: properly closed function
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get("/users/suggested");
        if (!Array.isArray(res.data)) return;

        const user = res.data.find((u) => u && u._id === id);
        if (user) {
          setRemoteUsername(user.username || "");
          setRemoteProfilePic(user.profilePic || "");

          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream.current;
          }
        }
      } catch (err) {
        console.error("Fetch user error:", err);
      }
    };

    // ✅ FIXED: separated from fetchUser
    const init = async () => {
      try {
        const turnRes = await fetch(METERED_URL);
        const iceServersResp = await turnRes.json();
        const iceServers = Array.isArray(iceServersResp)
          ? iceServersResp
          : iceServersResp.iceServers || [];

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        streamRef.current = stream;
        if (myVideoRef.current) myVideoRef.current.srcObject = stream;

        const pc = new RTCPeerConnection({ iceServers });
        pcRef.current = pc;

        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        pc.ontrack = (e) => {
          e.streams[0].getTracks().forEach((track) => {
            remoteStream.current.addTrack(track);
          });

          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream.current;
          }

          setRemoteVideoOn(true);
          setStatus("Connected");
        };

        pc.onicecandidate = (e) => {
          if (e.candidate) {
            const toId = isAnswering ? incomingCall?.from : id;
            if (toId) {
              socket.emit("iceCandidate", { to: toId, candidate: e.candidate });
            }
          }
        };

        if (!isAnswering) {
          setStatus("Ringing...");
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          socket.emit("callUser", {
            to: id,
            signal: offer,
            from: authUser._id,
            username: authUser.username,
          });
        } else if (incomingCall?.signal) {
          await pc.setRemoteDescription(
            new RTCSessionDescription(incomingCall.signal)
          );

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          socket.emit("answerCall", {
            to: incomingCall.from,
            signal: answer,
          });

          clearIncomingCall();
        }

        socket.on("callAccepted", async (sdp) => {
          await pc.setRemoteDescription(
            new RTCSessionDescription(sdp)
          );
          setStatus("Connected");
        });

        socket.on("iceCandidate", async ({ candidate }) => {
          if (candidate) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          }
        });

        socket.on("callEnded", handleExit);
      } catch (err) {
        console.error("WebRTC Error:", err);
        setStatus("Error");
      }
    };

    fetchUser(); // ✅ FIXED
    init();      // ✅ FIXED

    return () => {
      socket.off("callAccepted");
      socket.off("iceCandidate");
      socket.off("callEnded");
      streamRef.current?.getTracks().forEach((t) => t.stop());
      pcRef.current?.close();
    };
  }, [socket, id, incomingCall, isAnswering]);

  // ⏱ Timer
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

  const formatTime = (s) => {
    const mins = Math.floor(s / 60).toString().padStart(2, "0");
    const secs = (s % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const toggleAudio = () => {
    const track = streamRef.current?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setMyAudioOn(track.enabled);
    }
  };

  const toggleVideo = () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setMyVideoOn(track.enabled);
    }
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col">

      <video ref={remoteVideoRef} autoPlay className="w-full h-full object-cover absolute" />
      <video ref={myVideoRef} autoPlay muted className="w-32 h-40 absolute top-6 right-6 rounded-xl border" />

      <audio ref={remoteAudioRef} autoPlay />

      <div className="relative z-10 p-4 flex justify-between text-white">
        <span>{remoteUsername}</span>
        <span>{formatTime(callDuration)}</span>
      </div>

      <div className="mt-auto flex justify-center gap-6 pb-10 z-10">
        <button onClick={toggleAudio} className="bg-white/20 p-4 rounded-full">
          {myAudioOn ? "🎤" : "🔇"}
        </button>

        <button
          onClick={() => {
            const toId = isAnswering ? incomingCall?.from : id;
            if (toId) socket.emit("endCall", { to: toId });
            handleExit();
          }}
          className="bg-red-600 p-6 rounded-full"
        >
          📞
        </button>

        <button onClick={toggleVideo} className="bg-white/20 p-4 rounded-full">
          {myVideoOn ? "📹" : "🚫"}
        </button>
      </div>
    </div>
  );
};

export default VideoCallPage;