import axios from "axios";

const baseURL = import.meta.env.MODE === "development"
  ? "/api"
  : `https://chat-app-z2ay.onrender.com/api`;

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});

export default axiosInstance;