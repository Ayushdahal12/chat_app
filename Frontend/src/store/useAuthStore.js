import { create } from "zustand";
import axiosInstance from "../lib/axios";

export const useAuthStore = create((set) => ({
  authUser: null,
  isLoading: false,

  signup: async (data) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (data) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await axiosInstance.post("/auth/logout");
    set({ authUser: null });
  },

  getMe: async () => {
    try {
      const res = await axiosInstance.get("/users/me");
      set({ authUser: res.data });
    } catch {
      set({ authUser: null });
    }
  },
}));