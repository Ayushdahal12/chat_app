import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://chat-app-z2ay.onrender.com/api",
  withCredentials: true, // 🔥 THIS FIXES YOUR ISSUE
});

export default axiosInstance;


