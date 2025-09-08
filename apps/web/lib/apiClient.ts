import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:4000",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

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

        // Redirect to login
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
