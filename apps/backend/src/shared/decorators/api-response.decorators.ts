import { ApiResponse } from '@nestjs/swagger';

/**
 * Common API error response decorators
 */

export const ApiUnauthorizedResponse = () =>
  ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  });

export const ApiBadRequestResponse = (customMessage?: string) =>
  ApiResponse({
    status: 400,
    description: customMessage || 'Bad Request - validation errors',
  });

export const ApiNotFoundResponse = (resource?: string) =>
  ApiResponse({
    status: 404,
    description: `${resource || 'Resource'} not found`,
  });

export const ApiConflictResponse = (customMessage?: string) =>
  ApiResponse({
    status: 409,
    description: customMessage || 'Conflict - resource already exists',
  });

export const ApiInternalServerErrorResponse = () =>
  ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  });

/**
 * Common success responses
 */
export const ApiCreatedResponseWithExample = (example: any) =>
  ApiResponse({
    status: 201,
    description: 'Resource created successfully',
    example,
  });

export const ApiOkResponseWithExample = (example: any) =>
  ApiResponse({
    status: 200,
    description: 'Request successful',
    example,
  });

export const ApiNoContentResponse = () =>
  ApiResponse({
    status: 204,
    description: 'Resource deleted successfully',
  });
