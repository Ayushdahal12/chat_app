import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useMessageStore } from "../store/useMessageStore";
import { useSocketStore } from "../store/useSocketStore";
import axiosInstance from "../lib/axios";
import EmojiPicker from "emoji-picker-react";

const ChatPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const { messages, getMessages, sendMessage, addMessage } = useMessageStore();
  const { socket, onlineUsers } = useSocketStore();
  const [text, setText] = useState("");
  const [receiver, setReceiver] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    getMessages(id);
    axiosInstance.get(`/users/me`).then(() => {});
    axiosInstance.get(`/users/suggested`).then((res) => {
      const user = res.data.find((u) => u._id === id);
      if (user) setReceiver(user);
    });
  }, [id]);

  useEffect(() => {
    if (!socket) return;
    socket.on("newMessage", (message) => {
      if (message.senderId === id) addMessage(message);
    });
    return () => socket.off("newMessage");
  }, [socket, id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim()) return;
    await sendMessage(id, text);
    setText("");
    setShowEmoji(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isOnline = onlineUsers.includes(id);

  return (
    <div className="min-h-screen flex flex-col bg-base-200">
      {/* Header */}
      <div className="navbar bg-base-100 shadow px-6">
        <button className="btn btn-ghost btn-sm mr-2" onClick={() => navigate("/")}>
          ← Back
        </button>
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="w-10 rounded-full">
              <img
                src={receiver?.profilePic || `https://api.dicebear.com/7.x/thumbs/svg?seed=${receiver?.username}`}
                alt="avatar"
              />
            </div>
          </div>
          <div>
            <p className="font-bold">{receiver?.username || "User"}</p>
            <p className={`text-xs ${isOnline ? "text-success" : "text-base-content/50"}`}>
              {isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>
        <div className="flex-1" />
        <button
          className="btn btn-primary btn-sm"
          onClick={() => navigate(`/call/${id}`)}
        >
          📹 Video Call
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`chat ${msg.senderId === authUser._id ? "chat-end" : "chat-start"}`}
          >
            <div className={`chat-bubble ${msg.senderId === authUser._id ? "chat-bubble-primary" : ""}`}>
              {msg.text}
            </div>
            <div className="chat-footer text-xs opacity-50 mt-1">
              {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>



      {messages.map((msg) => {
  // Call message
  if (msg.type && msg.type !== "text") {
    const isMe = msg.senderId === authUser._id;
    const icon =
      msg.type === "call_ended" ? "📹" :
      msg.type === "call_missed" ? "📵" : "📞";
    const label =
      msg.type === "call_ended"
        ? `Video call ${isMe ? "you started" : "received"} · ${Math.floor(msg.callDuration / 60)}m ${msg.callDuration % 60}s`
        : msg.type === "call_missed"
        ? "Missed video call"
        : "Video call started";

    return (
      <div key={msg._id} className="flex justify-center my-2">
        <div className={`badge gap-1 p-3 ${
          msg.type === "call_missed" ? "badge-error" : "badge-info"
        }`}>
          {icon} {label}
        </div>
      </div>
    );
  }

  // Normal text message
  return (
    <div
      key={msg._id}
      className={`chat ${msg.senderId === authUser._id ? "chat-end" : "chat-start"}`}
    >
      <div className={`chat-bubble ${msg.senderId === authUser._id ? "chat-bubble-primary" : ""}`}>
        {msg.text}
      </div>
      <div className="chat-footer text-xs opacity-50 mt-1">
        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </div>
    </div>
  );
})}





      {/* Emoji Picker */}
      {showEmoji && (
        <div className="px-4">
          <EmojiPicker
            theme="dark"
            onEmojiClick={(e) => setText((prev) => prev + e.emoji)}
            height={350}
            width="100%"
          />
        </div>
      )}

      {/* Input */}
      <div className="p-4 bg-base-100 flex items-center gap-2">
        <button
          className="btn btn-ghost btn-sm text-xl"
          onClick={() => setShowEmoji(!showEmoji)}
        >
          😊
        </button>
        <input
          type="text"
          className="input input-bordered flex-1"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="btn btn-primary"
          onClick={handleSend}
          disabled={!text.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
};



export default ChatPage;




