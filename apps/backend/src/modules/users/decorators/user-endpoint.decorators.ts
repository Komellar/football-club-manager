import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UserApiBody } from './user-api.decorators';

/**
 * Composite decorator for POST /users - Create new user
 */
export const CreateUser = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Create a new user',
      description: 'Creates a new user account with the provided data',
    }),
    UserApiBody('create'),
    ApiResponse({
      status: 201,
      description: 'User created successfully',
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid user data provided',
    }),
    ApiResponse({
      status: 409,
      description: 'User with this email already exists',
    }),
  );

/**
 * Composite decorator for GET /users/:id - Get user by ID
 */
export const GetUserById = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get user by ID',
      description: 'Retrieves a specific user by their unique identifier',
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
      status: 404,
      description: 'User not found',
    }),
  );
