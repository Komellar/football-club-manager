import { z } from "zod";
import { RoleType } from "../enums/role-type";

export const CreateUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name cannot be empty")
    .max(100, "Name must be less than 100 characters")
    .regex(
      /^[a-zA-Z\s\-'\.]+$/,
      "Name can only contain letters, spaces, hyphens, apostrophes, and periods",
    ),

  email: z
    .email("Please enter a valid email address")
    .max(100, "Email must be less than 100 characters"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(255, "Password must be less than 255 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one lowercase letter, one uppercase letter, and one number",
    ),

  roleName: z.enum(RoleType).optional(),
});

// Public registration always creates a regular user.
export const CreateUserApiSchema = CreateUserSchema.transform((data) => ({
  ...data,
  roleName: RoleType.USER,
}));

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type CreateUserApiDto = z.infer<typeof CreateUserApiSchema>;

export const LoginSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(1, "Password cannot be empty"),
});

export type LoginDto = z.infer<typeof LoginSchema>;

// Response schemas with enhanced validation
export const UserResponseSchema = z.object({
  id: z.number().int().positive("User ID must be a positive integer"),
  name: z.string().trim().min(1, "Name cannot be empty"),
  email: z.email("Invalid email format"),
  role: z.enum(RoleType),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type UserResponseDto = z.infer<typeof UserResponseSchema>;

export const LoginResponseSchema = z.object({
  access_token: z.string().min(1, "Access token cannot be empty"),
  user: z.object({
    id: z.number().int().positive("User ID must be a positive integer"),
    name: z.string().trim().min(1, "Name cannot be empty"),
    email: z.email("Invalid email format"),
    role: z.enum(RoleType),
  }),
});

export type LoginResponseDto = z.infer<typeof LoginResponseSchema>;

export const UserSchema = z.object({
  userId: z.number().int().positive("User ID must be a positive integer"),
  name: z.string().trim().min(1, "Name cannot be empty"),
  email: z.email("Invalid email format"),
  role: z.enum(RoleType),
});

export type User = z.infer<typeof UserSchema>;

// Accept existing tokens issued with `id` while new tokens use `userId`.
export const AuthTokenPayloadSchema = z
  .union([
    UserSchema,
    UserSchema.omit({ userId: true }).extend({
      id: z.number().int().positive(),
    }),
  ])
  .transform(
    (payload): User => ({
      userId: "userId" in payload ? payload.userId : payload.id,
      name: payload.name,
      email: payload.email,
      role: payload.role,
    }),
  );
