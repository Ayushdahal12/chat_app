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
      console.log("🗑️  Fetching deleted posts...");
      const res = await axiosInstance.get("/posts/admin/deleted");
      console.log("✅ Deleted posts:", res.data.length, "posts");
      set({ deletedPosts: res.data });
    } catch (err) {
      console.error("❌ Error fetching deleted posts:", err);
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
      console.log("🗑️  Deleting post:", postId);
      await axiosInstance.delete(`/posts/${postId}`);
      console.log("✅ Post deleted, updating state");
      // ✅ Instead of removing, update the post to mark it as deleted
      set({
        posts: get().posts.map((p) =>
          p._id === postId
            ? { ...p, isDeleted: true }
            : p
        ),
      });
      // Also add to deletedPosts if admin is viewing
      const post = get().posts.find(p => p._id === postId);
      if (post) {
        console.log("📌 Adding to deletedPosts array");
        set({ deletedPosts: [{ ...post, isDeleted: true }, ...get().deletedPosts] });
      }
    } catch (err) {
      console.error("❌ Error deleting post:", err);
    }
  },
}));