import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Request, Response } from 'express';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';

interface ErrorResponse {
  statusCode: number;
  message: string | object;
  error: string;
  timestamp: string;
  path: string;
  method: string;
  requestId?: string;
  stack?: string;
}

const PG_UNIQUE_VIOLATION = '23505';
const PG_FOREIGN_KEY_VIOLATION = '23503';

/** Friendly messages for unique columns, keyed by the column in the error. */
const UNIQUE_MESSAGES: Record<string, string> = {
  email: 'An account with this email already exists',
  jersey_number: 'This jersey number is already taken by an active player',
};

/**
 * Turns database constraint errors (often a lost race against an earlier
 * check) into client errors instead of 500s. Returns undefined for anything
 * else. The driver's detail text is never sent, since it echoes values.
 */
export function describeConstraintViolation(
  exception: unknown,
): { statusCode: number; message: string; error: string } | undefined {
  if (!(exception instanceof QueryFailedError)) return undefined;
  const driverError = exception.driverError as
    | { code?: string; detail?: string }
    | undefined;
  const column = /Key \(([^)]+)\)/.exec(driverError?.detail ?? '')?.[1];
  if (driverError?.code === PG_UNIQUE_VIOLATION) {
    return {
      statusCode: HttpStatus.CONFLICT,
      message:
        (column && UNIQUE_MESSAGES[column]) ||
        'A record with these details already exists',
      error: 'Conflict',
    };
  }
  if (driverError?.code === PG_FOREIGN_KEY_VIOLATION) {
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'A referenced record does not exist',
      error: 'BadRequest',
    };
  }
  return undefined;
}

/**
 * Global exception filter that catches all unhandled exceptions
 * and provides consistent error response format.
 *
 * This filter handles both HttpExceptions and unexpected errors,
 * ensuring sensitive information is not exposed to clients.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    let statusCode: number;
    let message: string | object;
    let error: string;
    const constraint = describeConstraintViolation(exception);

    if (constraint) {
      ({ statusCode, message, error } = constraint);
    } else if (exception instanceof HttpException) {
      // Handle known HTTP exceptions
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = exception.constructor.name;
      } else {
        const responseObj = exceptionResponse as Record<string, unknown>;
        message = (responseObj.message as string) || exception.message;
        error = (responseObj.error as string) || exception.constructor.name;
      }

      // Log HTTP exceptions only in development or if they're server errors (5xx)
      if (process.env.NODE_ENV === 'development' || statusCode >= 500) {
        this.logger.warn(
          `HTTP Exception: ${statusCode} - ${JSON.stringify(message)} - ${request.method} ${request.url}`,
          exception.stack,
        );
      }
    } else if (exception instanceof EntityNotFoundError) {
      // Handle TypeORM EntityNotFoundError as 404
      statusCode = HttpStatus.NOT_FOUND;
      message = 'Resource not found';
      error = 'NotFound';

      // Log entity not found errors only in development
      if (process.env.NODE_ENV === 'development') {
        this.logger.warn(
          `Entity not found: ${request.method} ${request.url} - ${exception.message}`,
        );
      }
    } else {
      // Handle unexpected errors
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      error = 'InternalServerError';

      // Log all unexpected errors
      this.logger.error(
        `Unexpected error: ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const errorResponse: ErrorResponse = {
      statusCode,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(request) as string,
      method: request.method,
    };

    // Add request ID if available (useful for tracing)
    const requestId = request.headers['x-request-id'] as string;
    if (requestId) {
      errorResponse.requestId = requestId;
    }

    // In development, add stack trace for non-HTTP exceptions
    if (
      process.env.NODE_ENV === 'development' &&
      !(exception instanceof HttpException)
    ) {
      errorResponse.stack =
        exception instanceof Error ? exception.stack : undefined;
    }

    httpAdapter.reply(response, errorResponse, statusCode);
  }
}
