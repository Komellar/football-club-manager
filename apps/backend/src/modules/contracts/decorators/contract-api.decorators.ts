import { createZodApiBodyDecorator } from '../../../shared/decorators/api-body.decorators';
import { CreateContractSchema, UpdateContractSchema } from '@repo/core';

/**
 * Contract-specific API Body decorator
 * Usage: @ContractApiBody('create') or @ContractApiBody('update')
 * Automatically generates OpenAPI schemas from Zod schemas
 */
export const ContractApiBody = createZodApiBodyDecorator({
  create: {
    description: 'Contract data for creation',
    zodSchema: CreateContractSchema,
  },
  update: {
    description: 'Contract data to update (all fields optional)',
    zodSchema: UpdateContractSchema,
  },
});
