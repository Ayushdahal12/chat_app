import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useSocketStore } from "../store/useSocketStore";
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

  const [callDuration, setCallDuration] = useState(0);
  const [status, setStatus] = useState("Connecting...");
  const [remoteVideoOn, setRemoteVideoOn] = useState(false);
  const [myVideoOn, setMyVideoOn] = useState(true);

  const myVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const streamRef = useRef(null);
  const pcRef = useRef(null);
  const timerRef = useRef(null);

  // ✅ IMPORTANT FIX
  const remoteStreamRef = useRef(new MediaStream());

  // TIMER
  useEffect(() => {
    if (!remoteVideoOn) return;
    timerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [remoteVideoOn]);

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
        if (myVideoRef.current) {
          myVideoRef.current.srcObject = stream;
        }

        const pc = new RTCPeerConnection({
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            ...iceServers,
          ],
        });

        pcRef.current = pc;

        // add tracks
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        // ✅ FINAL FIXED TRACK HANDLER
        pc.ontrack = (event) => {
          const track = event.track;

          const exists = remoteStreamRef.current
            .getTracks()
            .find((t) => t.id === track.id);

          if (!exists) {
            remoteStreamRef.current.addTrack(track);
          }

          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStreamRef.current;
          }

          if (track.kind === "video") {
            setRemoteVideoOn(true);
            setStatus("Connected");
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

        // CALL LOGIC
        if (!isAnswering) {
          setStatus("Calling...");
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          socket.emit("callUser", {
            to: id,
            signal: offer,
            from: authUser._id,
          });
        } else {
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
      } catch (err) {
        setStatus("Camera/Mic Error");
      }
    };

    socket.on("callAccepted", async (sdp) => {
      await pcRef.current?.setRemoteDescription(
        new RTCSessionDescription(sdp)
      );
    });

    socket.on("iceCandidate", async ({ candidate }) => {
      if (candidate) {
        await pcRef.current?.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      }
    });

    socket.on("callEnded", () => endCall());

    init();

    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      pcRef.current?.close();
      clearInterval(timerRef.current);
    };
  }, [socket]);

  const endCall = async () => {
    try {
      await axiosInstance.post(`/messages/send/${id}`, {
        text: "Video Call",
        type: "call_ended",
        callDuration,
      });
    } catch (e) {}
    navigate(`/chat/${id}`);
  };

  const toggleVideo = () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setMyVideoOn(track.enabled);
    }
  };

  const formatTime = (s) => {
    const m = String(Math.floor(s / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${m}:${sec}`;
  };

  return (
    <div className="fixed inset-0 bg-black">

      {/* REMOTE VIDEO */}
      <div className="absolute inset-0">
        {remoteVideoOn ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            onLoadedMetadata={() =>
              remoteVideoRef.current?.play().catch(() => {})
            }
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-white">
            {status}
          </div>
        )}
      </div>

      {/* MY VIDEO (PIP) */}
      <div className="absolute top-6 right-6 w-32 h-44 rounded-xl overflow-hidden border border-white/20">
        <video
          ref={myVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover scale-x-[-1]"
        />
      </div>

      {/* TOP BAR */}
      <div className="absolute top-6 left-6 text-white font-mono text-lg">
        {formatTime(callDuration)}
      </div>

      {/* CONTROLS */}
      <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-6">
        <button
          onClick={toggleVideo}
          className="bg-white/20 px-6 py-3 rounded-full text-white"
        >
          {myVideoOn ? "Camera On" : "Camera Off"}
        </button>

        <button
          onClick={() => {
            socket.emit("endCall", {
              to: isAnswering ? incomingCall.from : id,
            });
            endCall();
          }}
          className="bg-red-600 px-6 py-3 rounded-full text-white"
        >
          End Call
        </button>
      </div>
    </div>
  );
};

export default VideoCallPage;