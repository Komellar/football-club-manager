import { Injectable, PipeTransform } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { z } from 'zod';

@Injectable()
export class WsValidationPipe<T extends z.ZodTypeAny> implements PipeTransform {
  constructor(private readonly schema: T) {}

  transform(value: unknown): z.infer<T> {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      const { formErrors, fieldErrors } = z.flattenError(result.error);
      throw new WsException({
        message: 'Validation failed',
        formErrors,
        fieldErrors,
      });
    }
    return result.data;
  }
}
