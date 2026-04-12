import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development"
    ? "http://localhost:8080/api"
    : "https://chat-app-z2ay.onrender.com/api",
  withCredentials: true,
});

export default axiosInstance;