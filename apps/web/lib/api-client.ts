import axios, { AxiosInstance } from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

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
        // Server-side: Use cookies (only in dynamic contexts)
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
      }
      // Client-side: the browser attaches the httpOnly auth_token cookie
      // itself (withCredentials), so no header is needed.
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
          const { store } = await import("../store");
          const { clearAuth } = await import("@/features/auth/store");
          store.dispatch(clearAuth());
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
