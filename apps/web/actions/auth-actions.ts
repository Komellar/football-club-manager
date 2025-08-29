"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import {
  LoginSchema,
  CreateUserSchema,
  type LoginDto,
  type CreateUserDto,
} from "@repo/utils";
import apiClient from "../lib/apiClient";
import { AxiosError } from "axios";
import { AUTH_COOKIE_NAME, COOKIE_MAX_AGE } from "../lib/constants";

async function callAuthAPI(endpoint: string, data: Record<string, unknown>) {
  try {
    const response = await apiClient.post(`/auth/${endpoint}`, data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorMessage =
        error.response?.data?.message || `${endpoint} failed`;
      throw new Error(errorMessage);
    }
    throw new Error(`${endpoint} failed`);
  }
}

async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export async function loginAction(data: LoginDto) {
  const result = LoginSchema.safeParse(data);
  if (!result.success) {
    return {
      error: "Invalid form data",
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  try {
    const response = await callAuthAPI("login", result.data);
    await setAuthCookie(response.access_token);
    return { success: true };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Network error. Please try again.",
    };
  }
}

export async function registerAction(data: CreateUserDto) {
  const result = CreateUserSchema.safeParse(data);
  if (!result.success) {
    return {
      error: "Invalid form data",
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  try {
    const response = await callAuthAPI("register", result.data);
    await setAuthCookie(response.access_token);
    return { success: true };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Network error. Please try again.",
    };
  }
}

export async function logoutAction() {
  try {
    const cookieStore = await cookies();

    cookieStore.delete(AUTH_COOKIE_NAME);
    redirect("/auth/login");
  } catch {
    const cookieStore = await cookies();
    cookieStore.delete(AUTH_COOKIE_NAME);
    redirect("/auth/login");
  }
}

export async function getProfileAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return null;
    }

    const response = await apiClient.get("/auth/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch {
    return null;
  }
}
