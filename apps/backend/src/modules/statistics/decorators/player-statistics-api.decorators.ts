import { createZodApiBodyDecorator } from '../../../shared/decorators/api-body.decorators';
import {
  CreatePlayerStatisticsSchema,
  UpdatePlayerStatisticsSchema,
} from '@repo/core';

/**
 * Player Statistics-specific API Body decorator
 * Usage: @PlayerStatisticsApiBody('create') or @PlayerStatisticsApiBody('update')
 * Automatically generates OpenAPI schemas from Zod schemas
 */
export const PlayerStatisticsApiBody = createZodApiBodyDecorator({
  create: {
    description: 'Player statistics data for creation',
    zodSchema: CreatePlayerStatisticsSchema,
  },
  update: {
    description: 'Player statistics data to update (all fields optional)',
    zodSchema: UpdatePlayerStatisticsSchema,
  },
});
