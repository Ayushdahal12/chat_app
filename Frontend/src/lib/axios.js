import axios from "axios";

const baseURL = import.meta.env.MODE === "development"
  ? "/api"
  : `https://chat-app-z2ay.onrender.com/api`;

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,  // ✅ Send cookies with all requests
  timeout: 10000,         // ✅ 10 second timeout
});

// ✅ Request interceptor: Add token to header + ensure credentials
axiosInstance.interceptors.request.use((config) => {
  // Ensure credentials are sent
  config.withCredentials = true;
  
  // Try to get token from cookie
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("jwt="))
    ?.split("=")[1];
  
  // 🔥 DEBUG: Log token and request details
  console.log(`📤 [${config.method?.toUpperCase()}] ${config.url}`);
  console.log(`   Cookie jwt token: ${token ? "✅ Found" : "❌ NOT FOUND"}`);
  console.log(`   All cookies: ${document.cookie}`);
  
  // ✅ Add to Authorization header as backup (for incognito mode)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log(`   Authorization header: Bearer ${token.substring(0, 20)}...`);
  } else {
    console.log(`   ⚠️ No token - only sending cookies`);
  }
  
  // ✅ Ensure Content-Type is set
  if (!config.headers["Content-Type"]) {
    config.headers["Content-Type"] = "application/json";
  }
  
  return config;
}, (error) => {
  console.error("❌ Request error:", error.message);
  return Promise.reject(error);
});

// ✅ Response interceptor: Handle errors gracefully
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // ✅ Log error for debugging
    if (error.response?.status === 401) {
      console.warn("⚠️ Unauthorized (401) - User not authenticated");
      // ❌ DO NOT redirect here - let the app handle it
      // This is normal during getMe() on first load
    } else if (error.response?.status === 400) {
      console.warn("❌ Bad Request (400):", error.response.data?.message);
    } else if (error.response?.status === 500) {
      console.error("🔴 Server Error (500):", error.response.data?.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;