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
import { EntityNotFoundError } from 'typeorm';

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

    if (exception instanceof HttpException) {
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
