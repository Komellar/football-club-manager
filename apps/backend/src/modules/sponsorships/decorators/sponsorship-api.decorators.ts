import { createZodApiBodyDecorator } from '../../../shared/decorators/api-body.decorators';
import { CreateSponsorshipSchema, UpdateSponsorshipSchema } from '@repo/core';

/**
 * Sponsorship-specific API Body decorator
 * Usage: @SponsorshipApiBody('create') or @SponsorshipApiBody('update')
 * Automatically generates OpenAPI schemas from Zod schemas
 */
export const SponsorshipApiBody = createZodApiBodyDecorator({
  create: {
    description: 'Sponsorship data for creation',
    zodSchema: CreateSponsorshipSchema,
  },
  update: {
    description: 'Sponsorship data to update (all fields optional)',
    zodSchema: UpdateSponsorshipSchema,
  },
});
