import axios, { AxiosInstance } from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const isServer = typeof window === "undefined";

const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL,
    timeout: 10000,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

  client.interceptors.request.use(
    async (config) => {
      if (isServer) {
        // Server-side: Use cookies
        try {
          const { cookies } = await import("next/headers");
          const cookieStore = await cookies();
          const authCookie = cookieStore.get("auth_token");
          if (authCookie?.value) {
            config.headers.Authorization = `Bearer ${authCookie.value}`;
          }
        } catch (error) {
          console.warn("Failed to get auth cookie:", error);
        }
      } else {
        // Client-side: Use auth store token
        try {
          const { useAuthStore } = await import(
            "../features/auth/store/auth-store"
          );
          const token = useAuthStore.getState().token;
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.warn("Failed to get auth token:", error);
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401 && !isServer) {
        // Clear auth state on client-side 401 errors
        try {
          const { useAuthStore } = await import(
            "../features/auth/store/auth-store"
          );
          useAuthStore.getState().clearAuth();
        } catch (e) {
          console.warn("Failed to clear auth state:", e);
        }
      }
      return Promise.reject(error);
    }
  );

  return client;
};

// Export the universal API client
export const apiClient = createApiClient();
