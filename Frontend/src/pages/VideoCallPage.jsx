import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useSocketStore } from "../store/useSocketStore";
import { useAuthStore } from "../store/useAuthStore";
import axiosInstance from "../lib/axios";

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
  const [status, setStatus] = useState("Connecting...");
  const [myVideoOn, setMyVideoOn] = useState(true);
  const [remoteVideoOn, setRemoteVideoOn] = useState(false);
  const myVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const pcRef = useRef(null);
  const callDurationRef = useRef(0);
  const iceCandidatesQueue = useRef([]);

  useEffect(() => {
    if (isAnswering) {
      setRemoteUsername(incomingCall?.username || "");
    }
    initCall();
    return () => cleanup();
  }, []);

  useEffect(() => {
    callDurationRef.current = callDuration;
  }, [callDuration]);

  useEffect(() => {
    if (!socket) return;

    socket.on("callAccepted", async (answerSdp) => {
      try {
        console.log("📞 Call accepted, setting remote description");
        await pcRef.current?.setRemoteDescription(
          new RTCSessionDescription(answerSdp)
        );
        // Process queued ICE candidates
        for (const candidate of iceCandidatesQueue.current) {
          await pcRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
        }
        iceCandidatesQueue.current = [];
        setCallStarted(true);
        setStatus("Connected");
        startTimer();
      } catch (e) {
        console.error("Error setting remote description:", e);
      }
    });

    socket.on("iceCandidate", async ({ candidate }) => {
      try {
        if (pcRef.current?.remoteDescription) {
          await pcRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          // Queue candidates until remote description is set
          iceCandidatesQueue.current.push(candidate);
        }
      } catch (e) {}
    });

    socket.on("callEnded", async () => {
      await saveCallLog("call_ended");
      cleanup();
      navigate(`/chat/${id}`);
    });

    return () => {
      socket.off("callAccepted");
      socket.off("iceCandidate");
      socket.off("callEnded");
    };
  }, [socket]);

  const initCall = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setStatus("Camera not supported!");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      if (myVideoRef.current) {
        myVideoRef.current.srcObject = stream;
      }

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          { urls: "stun:stun2.l.google.com:19302" },
        ],
      });
      pcRef.current = pc;

      // Add all tracks
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // When remote stream arrives
      pc.ontrack = (event) => {
        console.log("🎥 Remote track received!", event.streams[0]);
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
          setRemoteVideoOn(true);
        }
      };

      // Send ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket?.emit("iceCandidate", {
            to: isAnswering ? incomingCall?.from || id : id,
            candidate: event.candidate,
          });
        }
      };

      pc.onconnectionstatechange = () => {
        console.log("🔗 Connection state:", pc.connectionState);
        if (pc.connectionState === "connected") {
          setStatus("Connected");
          setCallStarted(true);
          startTimer();
        } else if (
          pc.connectionState === "failed" ||
          pc.connectionState === "disconnected"
        ) {
          setStatus("Connection lost ❌");
        }
      };

      pc.oniceconnectionstatechange = () => {
        console.log("🧊 ICE state:", pc.iceConnectionState);
      };

      if (!isAnswering) {
        // Caller
        setStatus("Ringing...");
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });
        await pc.setLocalDescription(offer);
        socket?.emit("callUser", {
          to: id,
          signal: offer,
          from: authUser._id,
          username: authUser.username,
        });
      } else {
        // Receiver
        setStatus("Connecting...");
        if (incomingCall?.signal) {
          await pc.setRemoteDescription(
            new RTCSessionDescription(incomingCall.signal)
          );
          // Process queued candidates
          for (const candidate of iceCandidatesQueue.current) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          }
          iceCandidatesQueue.current = [];

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket?.emit("answerCall", {
            to: incomingCall.from,
            signal: answer,
          });
          setCallStarted(true);
          setStatus("Connected");
          startTimer();
          clearIncomingCall();
        }
      }
    } catch (err) {
      console.error("❌ Error:", err);
      setStatus("Error: " + err.message);
    }
  };

  const startTimer = () => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const saveCallLog = async (type) => {
    try {
      await axiosInstance.post(`/messages/send/${id}`, {
        text: "Video call",
        type,
        callDuration: callDurationRef.current,
      });
    } catch (e) {}
  };

  const cleanup = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    pcRef.current?.close();
    clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const endCall = async () => {
    const type = callStarted ? "call_ended" : "call_missed";
    await saveCallLog(type);
    cleanup();
    socket?.emit("endCall", {
      to: isAnswering ? incomingCall?.from || id : id,
    });
    navigate(`/chat/${id}`);
  };

  const toggleVideo = () => {
    const videoTrack = streamRef.current?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setMyVideoOn(videoTrack.enabled);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">

      {/* Remote video — fullscreen background */}
      <div className="absolute inset-0">
        {remoteVideoOn ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center gap-4">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-36 h-36 rounded-full bg-primary/20 animate-ping" />
              <div className="avatar z-10">
                <div className="w-28 rounded-full ring-4 ring-primary ring-offset-4 ring-offset-black">
                  <img
                    src={`https://api.dicebear.com/7.x/thumbs/svg?seed=${remoteUsername || "user"}`}
                    alt="remote"
                  />
                </div>
              </div>
            </div>
            <p className="text-white text-2xl font-bold mt-4">
              {remoteUsername || "Calling..."}
            </p>
            <p className="text-white/50 animate-pulse">{status}</p>
          </div>
        )}
      </div>

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/70 to-transparent">
        <div className="flex items-center gap-3">
          <h1 className="text-white font-bold text-xl">GUFF</h1>
          {remoteUsername && (
            <span className="text-white/70 text-sm">
              · {remoteUsername}
            </span>
          )}
        </div>
        {callStarted ? (
          <div className="flex items-center gap-2 bg-black/50 rounded-full px-4 py-1.5">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-white text-sm font-mono font-bold">
              {formatTime(callDuration)}
            </span>
          </div>
        ) : (
          <span className="badge badge-warning animate-pulse px-4 py-3">
            ⏳ {status}
          </span>
        )}
      </div>

      {/* My video — picture in picture */}
      <div className="absolute top-20 right-4 z-20 flex flex-col items-center gap-1">
        <div className="relative w-32 h-44 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20">
          <video
            ref={myVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${!myVideoOn ? "hidden" : ""}`}
          />
          {!myVideoOn && (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <span className="text-4xl">🙈</span>
            </div>
          )}
        </div>
        <span className="text-white/70 text-xs font-medium">
          {authUser?.username || "You"}
        </span>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div className="flex items-center justify-center gap-8 p-8 bg-gradient-to-t from-black/90 to-transparent">

          {/* Toggle camera */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={toggleVideo}
              className={`btn btn-circle w-14 h-14 text-xl border-2 ${
                myVideoOn
                  ? "bg-white/20 border-white/30 text-white hover:bg-white/30"
                  : "bg-yellow-500 border-yellow-400 text-white"
              }`}
            >
              {myVideoOn ? "📹" : "🚫"}
            </button>
            <span className="text-white/70 text-xs">
              {myVideoOn ? "Camera" : "Off"}
            </span>
          </div>

          {/* End call */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={endCall}
              className="btn btn-circle w-20 h-20 bg-red-500 hover:bg-red-600 border-none text-3xl shadow-2xl hover:scale-105 transition-transform"
            >
              📵
            </button>
            <span className="text-white/70 text-xs">End Call</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default VideoCallPage;