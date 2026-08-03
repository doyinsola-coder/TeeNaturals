import axios from "axios";
import { toast } from "react-toastify";

const api = axios.create({
  baseURL: import.meta.env.VITE_PUBLIC_API_URL,
});

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem("tn_token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// If a request that carried a session token comes back 401/403, the session
// itself is the problem — expired, suspended, or the account was deleted.
// Surface the backend's actual message instead of silently bouncing to
// /login with no explanation, then clear the stale session.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const hadToken = Boolean(error?.config?.headers?.Authorization);
    const isLoginRequest = error?.config?.url?.includes("/auth/login");

    if ((status === 401 || status === 403) && hadToken && !isLoginRequest) {
      const message =
        error?.response?.data?.message ||
        "Your session has ended. Please log in again.";

      toast.error(message);

      localStorage.removeItem("tn_token");
      localStorage.removeItem("tn_user");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;