import { createZodApiBodyDecorator } from '../../../shared/decorators/api-body.decorators';
import { CreatePlayerSchema, UpdatePlayerSchema } from '@repo/core';

export const PlayerApiBody = createZodApiBodyDecorator({
  create: {
    description: 'Player data for creation',
    zodSchema: CreatePlayerSchema,
  },
  update: {
    description: 'Full player data (replaces the stored player)',
    zodSchema: UpdatePlayerSchema,
  },
});
