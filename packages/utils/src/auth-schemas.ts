import { z } from "zod";
import { RoleType } from "./role-type";

export const CreateUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  email: z.email("Invalid email format").max(100, "Email too long"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(255, "Password too long"),
  roleName: z.enum(RoleType).optional(),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;

export const LoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export type LoginDto = z.infer<typeof LoginSchema>;

export const UserResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.email(),
  role: z.object({
    id: z.number(),
    name: z.enum(RoleType),
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserResponseDto = z.infer<typeof UserResponseSchema>;

export const LoginResponseSchema = z.object({
  access_token: z.string(),
  user: z.object({
    id: z.number(),
    name: z.string(),
    email: z.email(),
    role: z.enum(RoleType),
  }),
});

export type LoginResponseDto = z.infer<typeof LoginResponseSchema>;
