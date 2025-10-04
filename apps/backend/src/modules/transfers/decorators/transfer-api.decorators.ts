import { createZodApiBodyDecorator } from '../../../shared/decorators/api-body.decorators';
import { CreateTransferSchema, UpdateTransferSchema } from '@repo/core';

/**
 * Transfer-specific API Body decorator
 * Usage: @TransferApiBody('create') or @TransferApiBody('update')
 * Automatically generates OpenAPI schemas from Zod schemas
 */
export const TransferApiBody = createZodApiBodyDecorator({
  create: {
    description: 'Transfer data for creation',
    zodSchema: CreateTransferSchema,
  },
  update: {
    description: 'Transfer data to update (all fields optional)',
    zodSchema: UpdateTransferSchema,
  },
});
