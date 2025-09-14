# @repo/core

This package contains all the core shared functionality for the Football Club Manager application.

## What's included

- **Types**: TypeScript enums and types
- **Zod Schemas**: Runtime validation schemas for API requests and responses
- **Type Definitions**: Inferred types from Zod schemas
- **Core Utilities**: Shared validation patterns and utilities

## Key exports

- `RoleType` - Enum for user roles (ADMIN, USER)
- `CreateUserSchema` & `CreateUserDto` - User creation validation
- `CreateUserApiSchema` & `CreateUserApiDto` - API-specific user creation validation
- `LoginSchema` & `LoginDto` - Login validation
- `UserSchema` & `User` - User type definitions
- `UserResponseSchema` & `UserResponseDto` - User API response type
- `LoginResponseSchema` & `LoginResponseDto` - Login API response type
- `IdSchema` - Generic ID validation
- `PaginationSchema` & `PaginationDto` - Pagination parameters

## Usage

```typescript
import { RoleType, CreateUserSchema, type User } from "@repo/core";

// Runtime validation
const result = CreateUserSchema.parse(userData);

// Type usage
const user: User = {
  userId: 1,
  name: "John Doe",
  email: "john@example.com",
  role: RoleType.USER,
};
```

This package consolidates core functionality including types, validation schemas, and utilities, providing a single source of truth for shared application concerns.
