import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { AuthApiBody } from './auth-api.decorators';

/**
 * Composite decorator for POST /auth/login - User login
 */
export const LoginUser = () =>
  applyDecorators(
    ApiOperation({
      summary: 'User login',
      description:
        'Authenticates a user with email and password, returns JWT access token for subsequent API calls.',
    }),
    AuthApiBody('login'),
    ApiOkResponse({
      description: 'Login successful, JWT token returned',
      example: {
        accessToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE2MzAwMDAwMDAsImV4cCI6MTYzMDAwMzYwMH0.abc123',
        user: {
          userId: 1,
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin',
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Invalid credentials - email or password incorrect',
    }),
    ApiBadRequestResponse({
      description: 'Invalid login data provided - validation errors',
    }),
  );

/**
 * Composite decorator for POST /auth/register - User registration
 */
export const RegisterUser = () =>
  applyDecorators(
    ApiOperation({
      summary: 'User registration',
      description: 'Creates a new user account and returns JWT token',
    }),
    AuthApiBody('register'),
    ApiCreatedResponse({
      description: 'Registration successful, JWT token returned',
    }),
    ApiConflictResponse({
      description: 'User with this email already exists',
    }),
    ApiBadRequestResponse({
      description: 'Invalid registration data provided',
    }),
  );

/**
 * Composite decorator for GET /auth/me - Get current user profile
 */
export const GetCurrentUser = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get current user profile',
      description: 'Retrieves the profile of the currently authenticated user',
    }),
    ApiOkResponse({
      description: 'User profile retrieved successfully',
    }),
    ApiUnauthorizedResponse({
      description: 'Authentication required',
    }),
  );
