import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

/**
 * Composite decorator for GET /users/:id - Get user by ID
 */
export const GetUserById = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get user by ID',
      description:
        'Retrieves your own account. Admins may retrieve any account.',
    }),
    ApiParam({
      name: 'id',
      type: 'number',
      description: 'User unique identifier',
    }),
    ApiResponse({
      status: 200,
      description: 'User found and returned successfully',
    }),
    ApiResponse({
      status: 403,
      description: 'The account belongs to someone else',
    }),
    ApiResponse({
      status: 404,
      description: 'User not found',
    }),
  );
