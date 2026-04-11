import { create } from "zustand";
import axiosInstance from "../lib/axios";

export const useUserStore = create((set) => ({
  suggestedUsers: [],
  isLoading: false,

  getSuggestedUsers: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/users/suggested");
      set({ suggestedUsers: res.data });
    } catch (err) {
      console.log(err);
    } finally {
      set({ isLoading: false });
    }
  },
}));