import { create } from "zustand";
import axiosInstance from "../lib/axios";

export const useUserStore = create((set) => ({
  suggestedUsers: [],
  isLoading: false,

  getSuggestedUsers: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/users/suggested");
      // ✅ Make sure it's always an array
      const users = Array.isArray(res.data) ? res.data : [];
      set({ suggestedUsers: users });
    } catch (err) {
      console.log(err);
      set({ suggestedUsers: [] });
    } finally {
      set({ isLoading: false });
    }
  },
}));