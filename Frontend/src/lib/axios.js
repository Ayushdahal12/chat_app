import axios from "axios";

const baseURL = import.meta.env.MODE === "development"
  ? "/api"
  : `https://chat-app-z2ay.onrender.com/api`;

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});

// ✅ Add token to every request header as backup
axiosInstance.interceptors.request.use((config) => {
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("jwt="))
    ?.split("=")[1];
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;