import { createZodApiBodyDecorator } from '../../../shared/decorators/api-body.decorators';
import { CreatePlayerSchema } from '@repo/core';

export const PlayerApiBody = createZodApiBodyDecorator({
  create: {
    description: 'Player data for creation',
    zodSchema: CreatePlayerSchema,
  },
  update: {
    description: 'Player data to update (all fields optional)',
    zodSchema: CreatePlayerSchema,
  },
});
