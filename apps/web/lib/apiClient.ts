import axios from "axios";
import { AUTH_COOKIE_NAME } from "./constants";

const apiClient = axios.create({
  baseURL: "http://localhost:4000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add JWT token from cookies
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    // Only on client side - get token from cookies
    const cookies = document.cookie.split(";");
    const authCookie = cookies.find((cookie) =>
      cookie.trim().startsWith(`${AUTH_COOKIE_NAME}=`),
    );

    if (authCookie) {
      const token = authCookie.split("=")[1];
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        // Clear auth state if available
        try {
          const { useAuthStore } = await import("@/features/auth");
          const store = useAuthStore.getState();
          store.clearAuth();
        } catch {
          // Ignore error if store is not available
        }

        // Clear the auth cookie
        document.cookie = `${AUTH_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;

        // Redirect to login
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
