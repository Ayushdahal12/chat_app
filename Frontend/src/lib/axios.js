import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.DEV
    ? "http://localhost:8080/api"
    : `${import.meta.env.VITE_BACKEND_URL}/api`,
  withCredentials: true,
});

export default axiosInstance;