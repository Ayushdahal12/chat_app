import { create } from "zustand";
import axiosInstance from "../lib/axios";
import { useSocketStore } from "./useSocketStore";

export const useAuthStore = create((set) => ({
  authUser: null,
  isLoading: false,

  signup: async (data) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      useSocketStore.getState().connectSocket(res.data._id);
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
      useSocketStore.getState().connectSocket(res.data._id);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await axiosInstance.post("/auth/logout");
    useSocketStore.getState().disconnectSocket();
    set({ authUser: null });
  },

  getMe: async () => {
    try {
      const res = await axiosInstance.get("/users/me");
      set({ authUser: res.data });
      useSocketStore.getState().connectSocket(res.data._id);
    } catch {
      set({ authUser: null });
    }
  },
}));