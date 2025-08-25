import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodError } from 'zod';

@Injectable()
export class ZodValidationPipe<T = unknown> implements PipeTransform {
  constructor(private schema: { parse: (value: unknown) => T }) {}

  transform(value: unknown): T {
    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException('Validation failed: ' + error.message);
      }
      throw new BadRequestException('Validation failed');
    }
  }
}
