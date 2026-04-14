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

  // ✅ FIX: correct remote stream handling
  const remoteStreamRef = useRef(new MediaStream());

  useEffect(() => {
    durationRef.current = callDuration;
  }, [callDuration]);

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
      } catch (e) {}
    };
    fetchUser();
  }, [id]);

  useEffect(() => {
    if (!socket) return;

    const init = async () => {
      try {
        const turnRes = await fetch(METERED_URL);
        const iceServers = await turnRes.json();

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        streamRef.current = stream;
        if (myVideoRef.current) myVideoRef.current.srcObject = stream;

        const pc = new RTCPeerConnection({ iceServers });
        pcRef.current = pc;

        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        // ✅ FIXED ontrack (PC + Mobile working)
        pc.ontrack = (event) => {
          console.log("🎥 Track received:", event.track.kind);

          remoteStreamRef.current.addTrack(event.track);

          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStreamRef.current;
          }

          if (event.track.kind === "video") {
            setRemoteVideoOn(true);
          }
        };

        pc.onicecandidate = (e) => {
          if (e.candidate) {
            socket.emit("iceCandidate", {
              to: isAnswering ? incomingCall.from : id,
              candidate: e.candidate,
            });
          }
        };

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
        }
      } catch (err) {
        setStatus("Media Error");
      }
    };

    socket.on("callAccepted", async (sdp) => {
      await pcRef.current?.setRemoteDescription(
        new RTCSessionDescription(sdp)
      );

      iceCandidatesQueue.current.forEach(c =>
        pcRef.current.addIceCandidate(new RTCIceCandidate(c))
      );
      iceCandidatesQueue.current = [];
    });

    socket.on("iceCandidate", async ({ candidate }) => {
      if (pcRef.current?.remoteDescription) {
        await pcRef.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      } else {
        iceCandidatesQueue.current.push(candidate);
      }
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
      await axiosInstance.post(`/messages/send/${id}`, {
        text: "Video Call",
        type: finalTime > 0 ? "call_ended" : "call_missed",
        callDuration: finalTime,
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
    }
  };

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col w-full h-[100dvh]">
      <audio ref={remoteAudioRef} autoPlay playsInline />

      {/* ✅ FIXED VIDEO TAG */}
      <div className="absolute inset-0">
        {remoteVideoOn ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            onLoadedMetadata={() => {
              remoteVideoRef.current?.play().catch(() => {});
            }}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900">
            <img
              src={
                remoteProfilePic ||
                `https://api.dicebear.com/7.x/thumbs/svg?seed=${remoteUsername}`
              }
              className="w-32 h-32 rounded-full mb-4"
              alt=""
            />
            <h2 className="text-white text-xl font-bold">
              {remoteUsername}
            </h2>
            <p className="text-blue-400 animate-pulse">{status}</p>
          </div>
        )}
      </div>

      <div className="absolute top-24 right-6 z-20">
        <video
          ref={myVideoRef}
          autoPlay
          playsInline
          muted
          className="w-28 h-40 object-cover"
        />
      </div>

      <div className="mt-auto flex justify-center gap-8 pb-12">
        <button onClick={toggleVideo} className="p-5 bg-white/10 rounded-full">
          📹
        </button>

        <button
          onClick={() => {
            socket.emit("endCall", {
              to: isAnswering ? incomingCall.from : id,
            });
            handleExit();
          }}
          className="p-6 bg-red-600 rounded-full"
        >
          📵
        </button>
      </div>
    </div>
  );
};

export default VideoCallPage;