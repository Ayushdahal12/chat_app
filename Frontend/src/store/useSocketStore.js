import { create } from "zustand";
import { io } from "socket.io-client";
import { useUserStore } from "./useUserStore";


const SOCKET_URL = window.location.hostname === "localhost"
  ? "http://localhost:8080"
  : "https://dioicous-nonorthodoxly-carl.ngrok-free.dev";

export const useSocketStore = create((set, get) => ({
  socket: null,
  onlineUsers: [],
  incomingCall: null,

  connectSocket: (userId) => {
    if (get().socket?.connected) return;

    const socket = io(SOCKET_URL, {
      query: { userId },
      transports: ["websocket"], // force websocket, avoid polling issues with ngrok
    });

    socket.on("getOnlineUsers", (users) => {
      set({ onlineUsers: users });
    });

    socket.on("receiveCall", ({ signal, from, username }) => {
      console.log("📞 Incoming call from:", username, from);
      set({ incomingCall: { signal, from, username } });
    });

    
    socket.on("newMessage", (message) => {
      useUserStore.getState().incrementUnread(message.senderId);
    });

    // NOTE: do NOT handle callEnded here — VideoCallPage handles it directly
    // Handling it here caused a race condition that wiped incomingCall too early

    set({ socket });
  },

  disconnectSocket: () => {
    get().socket?.disconnect();
    set({ socket: null, incomingCall: null });
  },

  clearIncomingCall: () => set({ incomingCall: null }),
}));