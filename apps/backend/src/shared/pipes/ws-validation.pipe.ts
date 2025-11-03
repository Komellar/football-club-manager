import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { ZodSchema } from 'zod';

/**
 * Validation pipe for WebSocket messages using Zod schemas
 * Throws WsException instead of HttpException for proper WebSocket error handling
 */
@Injectable()
export class WsValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error) {
      throw new WsException({
        message: 'Validation failed',
        errors: error.errors || error.message,
      });
    }
  }
}
