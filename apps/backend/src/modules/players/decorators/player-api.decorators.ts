import { createZodApiBodyDecorator } from '../../../shared/decorators/api-body.decorators';
import { CreatePlayerSchema, UpdatePlayerSchema } from '@repo/core';

/**
 * Player-specific API Body decorator
 * Usage: @PlayerApiBody('create') or @PlayerApiBody('update')
 * Automatically generates OpenAPI schemas from Zod schemas
 */
export const PlayerApiBody = createZodApiBodyDecorator({
  create: {
    description: 'Player data for creation',
    zodSchema: CreatePlayerSchema,
  },
  update: {
    description: 'Player data to update (all fields optional)',
    zodSchema: UpdatePlayerSchema,
  },
});
