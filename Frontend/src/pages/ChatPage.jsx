import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useMessageStore } from "../store/useMessageStore";
import { useSocketStore } from "../store/useSocketStore";
import axiosInstance from "../lib/axios";
import EmojiPicker from "emoji-picker-react";

const CLOUDINARY_CLOUD_NAME = "dhcpaoxx1";
const CLOUDINARY_UPLOAD_PRESET = "gg5z1art";

// Premium Zero-Dependency Icons
const Icons = {
  Back: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
  ),
  Video: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 10 4.553-2.276A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14V10z"/><rect width="14" height="12" x="1" y="6" rx="2"/></svg>
  ),
  Emoji: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>
  ),
  Image: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"/><line x1="16" x2="22" y1="5" y2="5"/><line x1="19" x2="19" y1="2" y2="8"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
  ),
  Send: ({ active }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-300 ${active ? 'rotate-0' : '-rotate-45 opacity-30'}`}><path d="m5 12 14-7-7 14-2-7-5-2Z"/><path d="m11 13 8-8"/></svg>
  )
};

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
        const user = res.data.find((u) => u._id === id);
        if (user) setReceiver(user);
      } catch (e) { console.error("Error fetching user", e); }
      setIsLoading(false);
    };
    fetchData();
  }, [id, getMessages]);

  useEffect(() => {
    if (!socket) return;
    socket.on("newMessage", (message) => {
      if (message.senderId === id) {
        addMessage(message);
        axiosInstance.put(`/messages/seen/${id}`);
        socket.emit("messageSeen", { to: id });
      }
    });
    socket.on("typing", ({ from }) => { if (from === id) setIsTyping(true); });
    socket.on("stopTyping", ({ from }) => { if (from === id) setIsTyping(false); });
    socket.on("messageSeen", ({ from }) => { if (from === id) setSeenMessages((prev) => ({ ...prev, [id]: true })); });
    
    return () => {
      socket.off("newMessage");
      socket.off("typing");
      socket.off("stopTyping");
      socket.off("messageSeen");
    };
  }, [socket, id, addMessage]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleTyping = (e) => {
    setText(e.target.value);
    socket?.emit("typing", { to: id });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit("stopTyping", { to: id });
    }, 2000);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: formData });
    const data = await res.json();
    return data.secure_url;
  };

  const handleSend = async () => {
    if (!text.trim() && !imagePreview) return;
    socket?.emit("stopTyping", { to: id });
    setIsUploading(true);
    try {
      let imageUrl = null;
      if (imagePreview) {
        const file = imageInputRef.current?.files[0];
        if (file) imageUrl = await uploadImage(file);
      }
      await sendMessage(id, text, "text", 0, imageUrl);
      setText("");
      setImagePreview(null);
      setShowEmoji(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  const isOnline = onlineUsers.includes(id);
  const formatDate = (date) => {
    const d = new Date(date);
    return d.toDateString() === new Date().toDateString() ? "Today" : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.createdAt);
    if (!groups[date]) groups[date] = [];
    groups[date].push(message);
    return groups;
  }, {});

  const lastMyMessageId = messages.filter((m) => m.senderId === authUser._id).slice(-1)[0]?._id;

  return (
    <div className="h-[100dvh] flex flex-col bg-[#F8F9FD] overflow-hidden relative">
      
      {/* HEADER: User Name सँग गफ */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-2xl border-b border-gray-100 px-4 md:px-12 h-20 flex items-center gap-4">
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 text-gray-400 transition-colors" onClick={() => navigate("/")}>
          <Icons.Back />
        </button>

        <div className="flex items-center gap-4 flex-1">
          <div className="relative cursor-pointer group" onClick={() => navigate(`/profile/${id}`)}>
            <div className="w-12 h-12 rounded-2xl overflow-hidden ring-4 ring-white shadow-md transition-all">
              <img src={receiver?.profilePic || `https://api.dicebear.com/7.x/thumbs/svg?seed=${receiver?.username}`} alt="avatar" />
            </div>
            {isOnline && <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />}
          </div>
          <div>
            <h2 className="font-black text-gray-900 text-lg tracking-tight">
              {receiver?.username || "User"} <span className="text-primary">सँग गफ</span>
            </h2>
            <p className={`text-[9px] uppercase tracking-widest font-black ${isOnline ? "text-green-600" : "text-gray-400"}`}>
              {isOnline ? "Online" : "Away"}
            </p>
          </div>
        </div>

        <button className="hidden sm:flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-100 rounded-2xl text-primary font-black text-xs uppercase tracking-widest shadow-sm hover:shadow-md transition-all" onClick={() => navigate(`/call/${id}`)}>
          <Icons.Video /> Video Call
        </button>
      </header>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto px-4 md:px-12 py-8 w-full max-w-5xl mx-auto space-y-8 no-scrollbar">
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date} className="space-y-6">
            <div className="flex items-center gap-6 opacity-20">
              <div className="h-px flex-1 bg-gray-400" />
              <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.4em]">{date}</span>
              <div className="h-px flex-1 bg-gray-400" />
            </div>

            {msgs.map((msg) => {
              const isMe = msg.senderId === authUser._id;
              const isSeen = msg.seen || (msg._id === lastMyMessageId && seenMessages[id]);

              return (
                <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2`}>
                  <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[85%] md:max-w-[70%]`}>
                    {msg.image && (
                      <div className="mb-2 rounded-[1.8rem] overflow-hidden border border-white shadow-lg">
                        <img src={msg.image} alt="shared" className="max-h-72 w-auto object-cover" />
                      </div>
                    )}
                    {msg.text && (
                      <div className={`px-6 py-3.5 rounded-[1.8rem] text-sm font-medium leading-relaxed shadow-sm
                        ${isMe ? "bg-primary text-white rounded-tr-none" : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"}
                      `}>
                        {msg.text}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2 px-2">
                      <span className="text-[8px] font-black text-gray-400 uppercase">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isMe && <span className={`text-[10px] ${isSeen ? "text-blue-500" : "text-gray-300"}`}>{isSeen ? "✓✓" : "✓"}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* TYPING INDICATOR */}
      {isTyping && (
        <div className="px-6 md:px-12 py-2 max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-3 px-4 py-2 w-fit bg-white border border-gray-100 rounded-full shadow-sm animate-in fade-in">
             <div className="flex gap-1">
               <div className="w-1 h-1 bg-primary rounded-full animate-bounce" />
               <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
             </div>
             <span className="text-[9px] font-black text-primary uppercase tracking-widest">Guffing...</span>
          </div>
        </div>
      )}

      {/* FOOTER: Floating Input */}
      <footer className="p-6 md:p-10 relative">
        <div className="max-w-4xl mx-auto relative">
          
          <div className="bg-white/90 backdrop-blur-2xl border border-gray-200 rounded-[2.5rem] p-2 flex items-center gap-2 shadow-[0_15px_30px_rgba(0,0,0,0.04)] focus-within:ring-4 ring-primary/5 transition-all">
            <button className={`w-11 h-11 flex items-center justify-center rounded-full transition-colors ${showEmoji ? 'text-primary bg-primary/5' : 'text-gray-400'}`} onClick={() => setShowEmoji(!showEmoji)}>
              <Icons.Emoji />
            </button>

            <label className="w-11 h-11 flex items-center justify-center rounded-full text-gray-400 cursor-pointer">
              <Icons.Image />
              <input ref={imageInputRef} type="file" className="hidden" onChange={handleImageSelect} accept="image/*" />
            </label>

            <input
              ref={inputRef}
              type="text"
              placeholder="यहाँ केहि लेख्नुहोस्..."
              className="flex-1 bg-transparent border-none focus:ring-0 px-2 text-gray-800 text-sm md:text-base font-medium placeholder:text-gray-300"
              value={text}
              onChange={handleTyping}
              onKeyDown={handleKeyDown}
            />

            <button 
              disabled={(!text.trim() && !imagePreview) || isUploading}
              onClick={handleSend}
              className={`w-11 h-11 flex items-center justify-center rounded-full transition-all
                ${(text.trim() || imagePreview) ? 'bg-primary text-white shadow-md active:scale-90' : 'bg-gray-50 text-gray-300'}`}
            >
              {isUploading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Icons.Send active={text.trim() || imagePreview} />}
            </button>
          </div>

          {showEmoji && (
            <div className="absolute bottom-[110%] right-0 z-50 animate-in fade-in zoom-in-95 origin-bottom-right rounded-3xl overflow-hidden border border-gray-200 shadow-2xl">
              <EmojiPicker onEmojiClick={(e) => { setText(p => p + e.emoji); inputRef.current?.focus(); }} width={320} height={400} />
            </div>
          )}
        </div>
      </footer>
    </div>
  );
};

export default ChatPage;