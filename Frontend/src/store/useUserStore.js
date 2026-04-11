import { create } from "zustand";
import axiosInstance from "../lib/axios";

export const useUserStore = create((set, get) => ({
  suggestedUsers: [],
  isLoading: false,
  unreadCounts: {},

  getSuggestedUsers: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/users/suggested");
      const users = Array.isArray(res.data) ? res.data : [];
      set({ suggestedUsers: users });
    } catch (err) {
      console.log(err);
      set({ suggestedUsers: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  incrementUnread: (userId) => {
    const counts = get().unreadCounts;
    set({ unreadCounts: { ...counts, [userId]: (counts[userId] || 0) + 1 } });
  },

  clearUnread: (userId) => {
    const counts = get().unreadCounts;
    set({ unreadCounts: { ...counts, [userId]: 0 } });
  },
}));