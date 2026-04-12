import { create } from "zustand";
import axiosInstance from "../lib/axios";

export const useMessageStore = create((set, get) => ({
  messages: [],
  isLoading: false,

  getMessages: async (userId) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (err) {
      console.log(err);
    } finally {
      set({ isLoading: false });
    }
  },

  sendMessage: async (receiverId, text, type = "text", callDuration = 0, image = null) => {
    try {
      const res = await axiosInstance.post(`/messages/send/${receiverId}`, {
        text, type, callDuration, image,
      });
      set({ messages: [...get().messages, res.data] });
    } catch (err) {
      console.log(err);
    }
  },

  addMessage: (message) => {
    set({ messages: [...get().messages, message] });
  },

  reactToMessage: async (messageId, emoji) => {
    try {
      const res = await axiosInstance.put(`/messages/react/${messageId}`, { emoji });
      set({
        messages: get().messages.map((m) =>
          m._id === messageId ? { ...m, reactions: res.data.reactions } : m
        ),
      });
    } catch (err) {
      console.log(err);
    }
  },

  updateReaction: (messageId, reactions) => {
    set({
      messages: get().messages.map((m) =>
        m._id === messageId ? { ...m, reactions } : m
      ),
    });
  },
}));