import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Request interceptor to automatically attach JWT tokens
// and ensure FormData requests are not corrupted by a forced Content-Type
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // When sending FormData (file uploads), remove any Content-Type header
  // so the browser auto-generates the correct multipart boundary string.
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

export default API;