import { applyDecorators } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { createSchema } from 'zod-openapi';
import { ZodType } from 'zod';
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

/**
 * Zod-based API Body decorator factory
 * Automatically generates OpenAPI schemas from Zod schemas using zod-openapi
 */
export function createZodApiBodyDecorator<T extends string>(
  schemas: Record<T, { description: string; zodSchema: ZodType }>,
) {
  return function (type: T) {
    const config = schemas[type];
    if (!config) {
      throw new Error(`Schema type '${type}' not found`);
    }

    // Generate schema using zod-openapi's createSchema function
    const { schema } = createSchema(config.zodSchema, {
      io: 'input', // This is for request body (input context)
    });

    return applyDecorators(
      ApiBody({
        description: config.description,
        schema: schema as SchemaObject,
      }),
    );
  };
}
