import { createZodApiBodyDecorator } from '../../../shared/decorators/api-body.decorators';
import { LoginSchema, CreateUserApiSchema } from '@repo/core';

/**
 * Auth-specific API Body decorator
 * Usage: @AuthApiBody('login') or @AuthApiBody('register')
 * Automatically generates OpenAPI schemas from Zod schemas
 */
export const AuthApiBody = createZodApiBodyDecorator({
  login: {
    description: 'Login credentials',
    zodSchema: LoginSchema,
  },
  register: {
    description: 'User registration data',
    zodSchema: CreateUserApiSchema,
  },
});
