import { create } from "zustand";
import axiosInstance from "../lib/axios";
import { useSocketStore } from "./useSocketStore";

export const useAuthStore = create((set) => ({
  authUser: null,
  isLoading: false,

  // ✅ SIGNUP
  signup: async (data) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data, {
        withCredentials: true, // 🔥 IMPORTANT
      });

      set({ authUser: res.data });

      // connect socket
      useSocketStore.getState().connectSocket(res.data._id);

      return { success: true };
    } catch (err) {
      return {
        success: false,
        message:
          err.response?.data?.message || "Signup failed",
      };
    } finally {
      set({ isLoading: false });
    }
  },

  // ✅ LOGIN
  login: async (data) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.post("/auth/login", data, {
        withCredentials: true, // 🔥 IMPORTANT
      });

      set({ authUser: res.data });

      useSocketStore.getState().connectSocket(res.data._id);

      return { success: true };
    } catch (err) {
      return {
        success: false,
        message:
          err.response?.data?.message || "Login failed",
      };
    } finally {
      set({ isLoading: false });
    }
  },

  // ✅ LOGOUT
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout", {}, {
        withCredentials: true, // 🔥 IMPORTANT
      });

      useSocketStore.getState().disconnectSocket();
      set({ authUser: null });
    } catch (err) {
      console.log("Logout error:", err);
    }
  },

  // ✅ GET CURRENT USER
  getMe: async () => {
    try {
      const res = await axiosInstance.get("/users/me", {
        withCredentials: true, // 🔥 IMPORTANT
      });

      set({ authUser: res.data });

      useSocketStore.getState().connectSocket(res.data._id);
    } catch (err) {
      set({ authUser: null });
    }
  },
}));