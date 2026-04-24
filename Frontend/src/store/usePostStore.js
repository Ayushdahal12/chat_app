import { create } from "zustand";
import axiosInstance from "../lib/axios";

export const usePostStore = create((set, get) => ({
  posts: [],
  deletedPosts: [],
  isLoading: false,

  getFeedPosts: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/posts");
      set({ posts: res.data });
    } catch (err) {
      console.log(err);
    } finally {
      set({ isLoading: false });
    }
  },

  getDeletedPosts: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/posts/admin/deleted");
      set({ deletedPosts: res.data });
    } catch (err) {
      console.log(err);
    } finally {
      set({ isLoading: false });
    }
  },

  createPost: async (image, caption) => {
    try {
      const res = await axiosInstance.post("/posts/create", { image, caption });
      set({ posts: [res.data, ...get().posts] });
      return { success: true };
    } catch (err) {
      return { success: false };
    }
  },

  likePost: async (postId) => {
    try {
      const res = await axiosInstance.put(`/posts/like/${postId}`);
      set({
        posts: get().posts.map((p) =>
          p._id === postId ? { ...p, likes: res.data.likes } : p
        ),
      });
    } catch (err) {
      console.log(err);
    }
  },

  commentPost: async (postId, text) => {
    try {
      const res = await axiosInstance.post(`/posts/comment/${postId}`, { text });
      set({
        posts: get().posts.map((p) =>
          p._id === postId
            ? { ...p, comments: [...p.comments, res.data] }
            : p
        ),
      });
    } catch (err) {
      console.log(err);
    }
  },

  deletePost: async (postId) => {
    try {
      await axiosInstance.delete(`/posts/${postId}`);
      set({ posts: get().posts.filter((p) => p._id !== postId) });
    } catch (err) {
      console.log(err);
    }
  },
}));