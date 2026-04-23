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
  
  // ✅ Add to Authorization header as backup (for incognito mode)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("🔐 Token found in cookie, adding to Authorization header");
  } else {
    console.log("⚠️ No token found in cookies for request:", config.url);
  }
  
  // ✅ Ensure Content-Type is set
  if (!config.headers["Content-Type"]) {
    config.headers["Content-Type"] = "application/json";
  }
  
  console.log("📤 Request:", {
    method: config.method,
    url: config.url,
    hasToken: !!token,
    headers: {
      Authorization: config.headers.Authorization ? "Present" : "Missing",
      "Content-Type": config.headers["Content-Type"],
    },
  });
  
  return config;
}, (error) => {
  console.error("❌ Request interceptor error:", error);
  return Promise.reject(error);
});

// ✅ Response interceptor: Handle 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log error for debugging
    if (error.response?.status === 401) {
      console.warn("⚠️ Unauthorized (401) - Token may have expired");
      // Clear invalid token
      document.cookie = "jwt=; path=/; max-age=0;";
      window.location.href = "/login";
    } else if (error.response?.status === 400) {
      console.warn("❌ Bad Request (400):", error.response.data?.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;