import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useMessageStore } from "../store/useMessageStore";
import { useSocketStore } from "../store/useSocketStore";
import axiosInstance from "../lib/axios";
import EmojiPicker from "emoji-picker-react";
import {
  ArrowLeft, Video, Smile, Image as ImageIcon,
  Send, Loader2, MoreHorizontal, CheckCheck, X
} from "lucide-react";

const CLOUDINARY_CLOUD_NAME = "dhcpaoxx1";
const CLOUDINARY_UPLOAD_PRESET = "gg5z1art";

const ChatPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const { messages, getMessages, sendMessage, addMessage } = useMessageStore();
  const { socket, onlineUsers } = useSocketStore();

  const [text, setText] = useState("");
  const [receiver, setReceiver] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [seenMessages, setSeenMessages] = useState({});

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const imageInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await getMessages(id);
      try {
        const res = await axiosInstance.get("/users/suggested");
        const users = Array.isArray(res.data) ? res.data : [];
        const user = users.find((u) => u._id === id);
        if (user) setReceiver(user);
      } catch (e) {}

      try {
        await axiosInstance.put(`/messages/seen/${id}`);
        socket?.emit("messageSeen", { to: id });
      } catch (e) {}

      setIsLoading(false);
    };
    fetchData();
  }, [id]);

  // Initialize seen from loaded messages
  useEffect(() => {
    if (messages.length === 0) return;
    const anySeenByThem = messages.some(
      (m) => m.senderId === authUser._id && m.seen === true
    );
    if (anySeenByThem) {
      setSeenMessages((prev) => ({ ...prev, [id]: true }));
    }
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    socket.on("newMessage", (message) => {
      if (message.senderId === id) {
        addMessage(message);
        axiosInstance.put(`/messages/seen/${id}`);
        socket.emit("messageSeen", { to: id });
      }
    });

    socket.on("typing", ({ from }) => {
      if (from === id) setIsTyping(true);
    });

    socket.on("stopTyping", ({ from }) => {
      if (from === id) setIsTyping(false);
    });

    socket.on("messageSeen", ({ from }) => {
      if (from === id) {
        setSeenMessages((prev) => ({ ...prev, [id]: true }));
      }
    });

    return () => {
      socket.off("newMessage");
      socket.off("typing");
      socket.off("stopTyping");
      socket.off("messageSeen");
    };
  }, [socket, id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleTyping = (e) => {
    setText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
    socket?.emit("typing", { to: id });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit("stopTyping", { to: id });
    }, 2000);
  };

  const handleSend = async () => {
    if (!text.trim() && !imagePreview) return;
    socket?.emit("stopTyping", { to: id });
    clearTimeout(typingTimeoutRef.current);
    setIsUploading(true);
    try {
      let imageUrl = null;
      if (imagePreview) {
        const formData = new FormData();
        formData.append("file", imageInputRef.current?.files[0]);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: "POST", body: formData }
        );
        const data = await res.json();
        imageUrl = data.secure_url;
      }
      await sendMessage(id, text, "text", 0, imageUrl);
      setText("");
      setImagePreview(null);
      setShowEmoji(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.createdAt);
    if (!groups[date]) groups[date] = [];
    groups[date].push(message);
    return groups;
  }, {});

  const myMessages = messages.filter((m) => m.senderId === authUser._id);
  const lastMyMessageId = myMessages[myMessages.length - 1]?._id;

  const isOnline = onlineUsers.includes(id);

  return (
    <div className="h-[100dvh] flex flex-col bg-[#F8F9FD] font-sans overflow-hidden">

      {/* HEADER */}
      <header className="bg-white/90 backdrop-blur-2xl border-b border-gray-100 px-6 md:px-12 py-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-5">
          <button
            onClick={() => navigate("/")}
            className="p-3 rounded-full hover:bg-gray-100 text-gray-400 transition-all"
          >
            <ArrowLeft size={22} strokeWidth={3} />
          </button>

          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={receiver?.profilePic || `https://api.dicebear.com/7.x/thumbs/svg?seed=${receiver?.username}`}
                className="w-14 h-14 rounded-2xl object-cover shadow-sm border-2 border-white"
                alt="receiver"
              />
              {isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-4 border-white" />
              )}
            </div>
            <div>
              <h2 className="font-black text-gray-900 leading-tight tracking-tight">
                {receiver?.username || "Guff User"}{" "}
                <span className="text-[#0a46b3]">सँग गफ</span>
              </h2>
              <p className={`text-[10px] uppercase font-black tracking-widest mt-1 ${
                isTyping
                  ? "text-green-500 animate-pulse"
                  : isOnline
                  ? "text-green-500"
                  : "text-gray-300"
              }`}>
                {isTyping ? "✍️ typing..." : isOnline ? "Active Now" : "Offline"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/call/${id}`)}
            className="p-4 bg-blue-50 text-[#0a46b3] rounded-2xl hover:bg-blue-100 transition-all"
          >
            <Video size={20} strokeWidth={2.5} />
          </button>
          <button className="p-4 text-gray-300 hover:text-gray-600 transition-all">
            <MoreHorizontal size={24} />
          </button>
        </div>
      </header>

      {/* MESSAGES AREA */}
      <main className="flex-1 overflow-y-auto p-6 md:px-12 py-8">
        <div className="max-w-4xl mx-auto space-y-2">
          {isLoading ? (
            <div className="flex justify-center mt-20">
              <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center mt-20 text-gray-300">
              <img
                src={receiver?.profilePic || `https://api.dicebear.com/7.x/thumbs/svg?seed=${receiver?.username}`}
                className="w-20 h-20 rounded-2xl mb-4 shadow-md"
                alt="avatar"
              />
              <p className="font-black text-gray-400">{receiver?.username}</p>
              <p className="text-sm mt-1">Say hi to start the conversation! 👋</p>
            </div>
          ) : (
            Object.entries(groupedMessages).map(([date, msgs]) => (
              <div key={date}>
                {/* Date separator */}
                <div className="flex items-center gap-3 my-6">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-[10px] text-gray-300 font-black uppercase tracking-widest px-2">
                    {date}
                  </span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                {msgs.map((msg, idx) => {
                  const isMe = msg.senderId === authUser._id;
                  const isLastMyMsg = msg._id === lastMyMessageId;
                  const isSeen = msg.seen || (isLastMyMsg && seenMessages[id]);

                  // ✅ Call message
                  if (msg.type && msg.type !== "text") {
                    const icon =
                      msg.type === "call_ended" ? "📹" :
                      msg.type === "call_missed" ? "📵" : "📞";
                    const label =
                      msg.type === "call_ended"
                        ? `Video call · ${Math.floor(msg.callDuration / 60)}m ${msg.callDuration % 60}s`
                        : "Missed video call";
                    return (
                      <div key={msg._id} className="flex justify-center my-3">
                        <div className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold ${
                          msg.type === "call_missed"
                            ? "bg-red-50 text-red-400 border border-red-100"
                            : "bg-blue-50 text-blue-400 border border-blue-100"
                        }`}>
                          {icon} {label}
                        </div>
                      </div>
                    );
                  }

                  // Normal message
                  return (
                    <div
                      key={msg._id || idx}
                      className={`flex ${isMe ? "justify-end" : "justify-start"} mb-1`}
                    >
                      {/* Receiver avatar */}
                      {!isMe && (
                        <img
                          src={receiver?.profilePic || `https://api.dicebear.com/7.x/thumbs/svg?seed=${receiver?.username}`}
                          className="w-8 h-8 rounded-xl object-cover mr-3 self-end shadow-sm"
                          alt="avatar"
                        />
                      )}

                      <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[75%]`}>
                        {/* Image */}
                        {msg.image && (
                          <div
                            className="mb-2 rounded-[2rem] overflow-hidden border-4 border-white shadow-xl cursor-pointer hover:scale-[1.02] transition-transform"
                            onClick={() => window.open(msg.image, "_blank")}
                          >
                            <img
                              src={msg.image}
                              alt="shared"
                              className="max-h-64 w-full object-cover"
                            />
                          </div>
                        )}

                        {/* Text */}
                        {msg.text && (
                          <div className={`px-6 py-3 rounded-[2rem] text-sm font-semibold leading-relaxed shadow-sm ${
                            isMe
                              ? "bg-[#0a46b3] text-white rounded-tr-none"
                              : "bg-white text-gray-700 rounded-tl-none border border-gray-100"
                          }`}>
                            {msg.text}
                          </div>
                        )}

                        {/* Time + seen */}
                        <div className="mt-1 px-2 flex items-center gap-1">
                          <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">
                            {formatTime(msg.createdAt)}
                          </span>
                          {isMe && (
                            <CheckCheck
                              size={14}
                              className={isSeen ? "text-blue-500" : "text-gray-200"}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start mb-2">
              <img
                src={receiver?.profilePic || `https://api.dicebear.com/7.x/thumbs/svg?seed=${receiver?.username}`}
                className="w-8 h-8 rounded-xl object-cover mr-3 self-end shadow-sm"
                alt="avatar"
              />
              <div className="bg-white rounded-[2rem] rounded-tl-none px-5 py-4 shadow-sm border border-gray-100 flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </main>

      {/* FOOTER */}
      <footer className="p-4 md:p-6 relative bg-white/50 backdrop-blur-md border-t border-gray-100">
        <div className="max-w-4xl mx-auto">

          {/* Image preview */}
          {imagePreview && (
            <div className="absolute bottom-[100%] left-0 w-full p-4">
              <div className="relative w-full max-w-sm mx-auto bg-white p-3 rounded-[3rem] shadow-2xl border border-gray-100">
                <img
                  src={imagePreview}
                  className="w-full h-64 object-cover rounded-[2.2rem]"
                  alt="preview"
                />
                <button
                  onClick={() => {
                    setImagePreview(null);
                    if (imageInputRef.current) imageInputRef.current.value = "";
                  }}
                  className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-2 shadow-xl border-4 border-white hover:scale-110 transition-all"
                >
                  <X size={16} strokeWidth={3} />
                </button>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                  Ready to send
                </div>
              </div>
            </div>
          )}

          <div className="flex items-end gap-3 bg-white p-3 rounded-[3rem] shadow-sm border border-gray-100 focus-within:ring-4 ring-blue-500/5 transition-all">

            {/* Emoji */}
            <button
              onClick={() => setShowEmoji(!showEmoji)}
              className="w-12 h-12 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-50 transition-all"
            >
              <Smile size={26} strokeWidth={2.5} />
            </button>

            {/* Image */}
            <label className="w-12 h-12 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-50 cursor-pointer transition-all">
              <ImageIcon size={26} strokeWidth={2.5} />
              <input
                ref={imageInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const reader = new FileReader();
                  reader.onload = () => setImagePreview(reader.result);
                  reader.readAsDataURL(e.target.files[0]);
                }}
              />
            </label>

            {/* Text input */}
            <textarea
              ref={inputRef}
              rows="1"
              placeholder="Guff लेख्नुहोस्..."
              className="flex-1 max-h-32 py-3 px-2 bg-transparent border-none focus:ring-0 text-gray-800 font-bold placeholder:text-gray-200 resize-none leading-relaxed outline-none"
              value={text}
              onChange={handleTyping}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />

            {/* Send */}
            <button
              onClick={handleSend}
              disabled={(!text.trim() && !imagePreview) || isUploading}
              className={`w-14 h-14 flex items-center justify-center rounded-full transition-all duration-300 ${
                text.trim() || imagePreview
                  ? "bg-[#0a46b3] text-white shadow-xl scale-105"
                  : "bg-gray-50 text-gray-200"
              }`}
            >
              {isUploading
                ? <Loader2 className="animate-spin" size={20} />
                : <Send size={22} strokeWidth={3} />
              }
            </button>
          </div>

          {/* Emoji picker */}
          {showEmoji && (
            <div className="absolute bottom-[115%] right-4 z-50 shadow-2xl rounded-[2rem] overflow-hidden">
              <EmojiPicker
                onEmojiClick={(e) => {
                  setText((prev) => prev + e.emoji);
                  inputRef.current?.focus();
                }}
                width={320}
                height={380}
              />
            </div>
          )}
        </div>
      </footer>
    </div>
  );
};

export default ChatPage;