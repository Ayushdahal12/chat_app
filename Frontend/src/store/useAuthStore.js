import { create } from "zustand";
import axiosInstance from "../lib/axios";
import { useSocketStore } from "./useSocketStore";

export const useAuthStore = create((set) => ({
  authUser: null,
  isLoading: false,
  isCheckingAuth: true,  // ✅ Added: prevent multiple getMe() calls

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
      console.log("🔐 Attempting login for:", data.email);
      const res = await axiosInstance.post("/auth/login", data, {
        withCredentials: true,
      });

      console.log("✅ Login response:", res.data);
      set({ authUser: res.data });

      console.log("📡 Connecting socket with userId:", res.data._id);
      useSocketStore.getState().connectSocket(res.data._id);

      console.log("✅ Login successful - authUser set");
      return { success: true };
    } catch (err) {
      console.error("❌ Login error:", {
        status: err.response?.status,
        message: err.response?.data?.message,
        fullError: err.message,
      });
      return {
        success: false,
        message:
          err.response?.data?.message || err.message || "Login failed",
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
    set({ isCheckingAuth: true });
    try {
      console.log("🔍 Checking auth status...");
      const res = await axiosInstance.get("/users/me", {
        withCredentials: true,
        timeout: 5000,  // 5 second timeout
      });

      console.log("✅ Auth check successful:", res.data.username);
      set({ authUser: res.data });

      // Connect socket only if user is authenticated
      useSocketStore.getState().connectSocket(res.data._id);
    } catch (err) {
      // 401 is expected when user is not logged in - don't treat as error
      if (err.response?.status === 401) {
        console.log("✓ User not authenticated (expected on first load)");
      } else if (err.code === "ECONNABORTED") {
        console.warn("⚠️ Auth check timeout - backend might be slow");
      } else {
        console.warn("⚠️ Auth check failed:", err.message);
      }
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });  // ✅ Always stop loading
    }
  },
}));