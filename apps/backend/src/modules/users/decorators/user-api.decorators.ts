import { createZodApiBodyDecorator } from '../../../shared/decorators/api-body.decorators';
import { CreateUserApiSchema } from '@repo/core';

/**
 * User-specific API Body decorator
 * Usage: @UserApiBody('create')
 * Automatically generates OpenAPI schemas from Zod schemas
 */
export const UserApiBody = createZodApiBodyDecorator({
  create: {
    description: 'User data for creation',
    zodSchema: CreateUserApiSchema,
  },
});
