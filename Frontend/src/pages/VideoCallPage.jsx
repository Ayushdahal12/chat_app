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

  const [status, setStatus] = useState("Connecting...");
  const [remoteVideoOn, setRemoteVideoOn] = useState(false);

  const myVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const streamRef = useRef(null);
  const pcRef = useRef(null);
  const iceQueue = useRef([]);

  useEffect(() => {
    if (!socket) return;

    const init = async () => {
      try {
        // ✅ FIX 1: Proper ICE parsing
        const turnRes = await fetch(METERED_URL);
        const iceServersResp = await turnRes.json();

        const iceServers = Array.isArray(iceServersResp)
          ? iceServersResp
          : iceServersResp.iceServers || [];

        // ✅ Get camera + mic
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        streamRef.current = stream;
        if (myVideoRef.current) {
          myVideoRef.current.srcObject = stream;
        }

        // ✅ Create Peer
        const pc = new RTCPeerConnection({
          iceServers,
          iceCandidatePoolSize: 10,
        });
        pcRef.current = pc;

        // Add tracks
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        // ✅🔥 FIX 2: Correct ontrack (MAIN FIX)
        pc.ontrack = (event) => {
          console.log("🎥 Track:", event.track.kind);

          if (!remoteVideoRef.current) return;

          // Create stream manually
          if (!remoteVideoRef.current.srcObject) {
            remoteVideoRef.current.srcObject = new MediaStream();
          }

          remoteVideoRef.current.srcObject.addTrack(event.track);

          if (event.track.kind === "video") {
            setRemoteVideoOn(true);
            setStatus("Connected");
          }
        };

        // ICE send
        pc.onicecandidate = (e) => {
          if (e.candidate) {
            const toId = isAnswering ? incomingCall?.from : id;
            if (toId) {
              socket.emit("iceCandidate", {
                to: toId,
                candidate: e.candidate,
              });
            }
          }
        };

        // CALLER
        if (!isAnswering) {
          setStatus("Ringing...");
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          socket.emit("callUser", {
            to: id,
            signal: offer,
            from: authUser._id,
          });
        }

        // RECEIVER
        else if (incomingCall?.signal) {
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

        // ACCEPTED
        socket.on("callAccepted", async (sdp) => {
          if (!pcRef.current) return;

          await pcRef.current.setRemoteDescription(
            new RTCSessionDescription(sdp)
          );

          // Apply queued ICE
          iceQueue.current.forEach((c) =>
            pcRef.current.addIceCandidate(new RTCIceCandidate(c))
          );
          iceQueue.current = [];
        });

        // RECEIVE ICE
        socket.on("iceCandidate", async ({ candidate }) => {
          if (!pcRef.current) return;

          if (pcRef.current.remoteDescription) {
            await pcRef.current.addIceCandidate(
              new RTCIceCandidate(candidate)
            );
          } else {
            iceQueue.current.push(candidate);
          }
        });

        socket.on("callEnded", () => handleExit());

      } catch (err) {
        console.error("❌ WebRTC Error:", err);
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
  }, [socket, id, incomingCall, isAnswering]);

  const handleExit = () => {
    navigate(`/chat/${id}`);
  };

  return (
    <div className="fixed inset-0 bg-black">

      {/* Remote Video */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />

      {/* Local Video */}
      <video
        ref={myVideoRef}
        autoPlay
        muted
        className="absolute top-6 right-6 w-32 h-40 rounded-xl border"
      />

      {/* Status */}
      {!remoteVideoOn && (
        <div className="absolute inset-0 flex items-center justify-center text-white">
          {status}
        </div>
      )}

      {/* End Call */}
      <button
        onClick={() => {
          const toId = isAnswering ? incomingCall?.from : id;
          if (toId) socket.emit("endCall", { to: toId });
          handleExit();
        }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-full"
      >
        End Call
      </button>
    </div>
  );
};

export default VideoCallPage;