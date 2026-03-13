import axios from "axios";

// Prefer an explicit API URL when provided.
// In local development we fall back to the Vite `/api` proxy,
// which forwards to the backend (see `vite.config.js`).
const baseURL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "/api" : "/api");

const api = axios.create({ baseURL });

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("sk_token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  (r) => r.data,
  (err) => Promise.reject(err?.response?.data || err)
);

export default api;
