import { AxiosError, AxiosResponse } from "axios";
import {
  LoginSchema,
  CreateUserSchema,
  type LoginDto,
  type CreateUserDto,
  type LoginResponseDto,
  type User,
} from "@repo/core";
import { apiClient } from "@/lib/api-client";
import { ActionResult } from "@/types/action-result";

async function callAuthAPI(
  endpoint: string,
  payload: Record<string, unknown>
): Promise<LoginResponseDto> {
  try {
    const { data }: AxiosResponse<LoginResponseDto> = await apiClient.post(
      `/auth/${endpoint}`,
      payload
    );
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorMessage =
        error.response?.data?.message || `${endpoint} failed`;
      throw new Error(errorMessage);
    }
    throw new Error(`${endpoint} failed`);
  }
}

export const login = async (data: LoginDto): Promise<ActionResult> => {
  const result = LoginSchema.safeParse(data);
  if (!result.success) {
    return {
      error: "Invalid form data",
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  try {
    // Backend will handle setting the cookie directly
    const response = await callAuthAPI("login", result.data);

    // Store token in Redux store for API requests
    if (typeof window !== "undefined") {
      const { store } = await import("@/store");
      const { setToken } = await import("../store");
      store.dispatch(setToken(response.access_token));
    }

    return {};
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Network error. Please try again.",
    };
  }
};

export const register = async (data: CreateUserDto): Promise<ActionResult> => {
  const result = CreateUserSchema.safeParse(data);
  if (!result.success) {
    return {
      error: "Invalid form data",
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  try {
    // Backend will handle setting the cookie directly
    const response = await callAuthAPI("register", result.data);

    // Store token in Redux store for API requests
    if (typeof window !== "undefined") {
      const { store } = await import("@/store");
      const { setToken } = await import("../store");
      store.dispatch(setToken(response.access_token));
    }

    return {};
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Network error. Please try again.",
    };
  }
};

function clearReduxAuth() {
  if (typeof window !== "undefined") {
    import("@/store").then(({ store }) => {
      import("../store").then(({ clearAuth }) => {
        store.dispatch(clearAuth());
      });
    });
  }
}

export const logout = async () => {
  try {
    // Backend will handle clearing the cookie directly
    await apiClient.post("/auth/logout");
    clearReduxAuth();
  } catch (error) {
    // Even if logout fails, clear the local token
    clearReduxAuth();
    throw error;
  }
};

export const getProfile = async (): Promise<User | null> => {
  try {
    // Since cookies are httpOnly, we rely on the server to include them automatically
    const { data }: AxiosResponse<User> = await apiClient.get("/auth/profile");
    return data;
  } catch {
    return null;
  }
};
