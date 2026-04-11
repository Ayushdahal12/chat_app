import axios from "axios";

const baseURL = window.location.hostname === "localhost"
  ? "/api"
  : `${window.location.origin}/api`;

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});

export default axiosInstance;