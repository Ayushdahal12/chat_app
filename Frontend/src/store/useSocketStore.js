import { create } from "zustand";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.MODE === "development"
  ? "http://localhost:8080"
  : "https://chat-app-z2ay.onrender.com";

export const useSocketStore = create((set, get) => ({
  socket: null,
  onlineUsers: [],
  incomingCall: null,

  connectSocket: (userId) => {
    // ✅ Don't reconnect if already connected
    if (get().socket?.connected) {
      console.log("✓ Socket already connected");
      return;
    }

    const socket = io(SOCKET_URL, {
      query: { userId },
      withCredentials: true,
      transports: ["websocket", "polling"],  // ✅ websocket first for better performance
      reconnection: true,
      reconnectionAttempts: 5,  // ✅ Limit reconnection attempts
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.warn("⚠️ Socket error:", err.message);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    socket.on("getOnlineUsers", (users) => {
      set({ onlineUsers: users });
    });

    socket.on("receiveCall", ({ signal, from, username }) => {
      console.log("📞 Incoming call from:", username);
      set({ incomingCall: { signal, from, username } });
    });

    socket.on("callEnded", () => {
      set({ incomingCall: null });
    });

    set({ socket });
  },

  disconnectSocket: () => {
    get().socket?.disconnect();
    set({ socket: null, onlineUsers: [], incomingCall: null });
  },

  clearIncomingCall: () => set({ incomingCall: null }),
}));