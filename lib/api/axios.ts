import axios from "axios";
import type { RootState } from "@/lib/redux/store";
import type { AppDispatch } from "@/lib/redux/store";

// Create axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Store reference for accessing Redux store
let store: { getState: () => RootState; dispatch: AppDispatch } | null = null;

export const setStore = (storeInstance: {
  getState: () => RootState;
  dispatch: AppDispatch;
}) => {
  store = storeInstance;
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Get token from Redux store or localStorage
    let token = null;

    if (store) {
      token = store.getState().auth.token;
    }

    if (!token && typeof window !== "undefined") {
      token = localStorage.getItem("token");
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Clear auth state and redirect to login
      if (store) {
        const { logout } = await import("@/lib/redux/slices/authSlice");
        store.dispatch(logout());
      }

      // Clear localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        // Redirect to login page
        window.location.href = "/auth/signin";
      }
    }

    // Handle network errors
    if (!error.response) {
      error.message = "Network error. Please check your connection.";
    }

    return Promise.reject(error);
  }
);

export default api;
