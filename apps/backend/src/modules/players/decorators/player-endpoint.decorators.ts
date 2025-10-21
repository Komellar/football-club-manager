import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiNoContentResponse,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { SortOrder } from '@repo/core';
import { PlayerPosition, VALID_NATIONALITIES } from '@repo/core';
import { PlayerApiBody } from './player-api.decorators';

/**
 * Composite decorators for Players endpoints
 * These combine multiple decorators into single, meaningful ones
 */

export const CreatePlayer = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Create a new player',
      description:
        'Creates a new player record with personal information, position, and physical attributes. Requires authentication.',
    }),
    PlayerApiBody('create'),
    ApiCreatedResponse({
      description: 'Player created successfully',
      example: {
        id: 1,
        name: 'Lionel Messi',
        position: 'forward',
        dateOfBirth: '1987-06-24T00:00:00.000Z',
        nationality: 'ARG',
        height: 170,
        weight: 72,
        jerseyNumber: 10,
        marketValue: 50000000,
        isActive: true,
        imageUrl: 'https://example.com/players/messi.jpg',
        age: 37,
        createdAt: '2025-10-04T19:00:00.000Z',
        updatedAt: '2025-10-04T19:00:00.000Z',
      },
    }),
    ApiBadRequestResponse({
      description: 'Invalid input data - validation errors',
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized - JWT token required',
    }),
    ApiConflictResponse({
      description: 'Conflict - player with similar name already exists',
    }),
  );

export const GetAllPlayers = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get all players with optional filtering and pagination',
      description:
        'Retrieves a paginated list of players with optional filtering by position, nationality, age range, and search terms.',
    }),
    ApiQuery({
      name: 'page',
      required: false,
      description: 'Page number (starts from 1)',
      type: Number,
      example: 1,
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      description: 'Items per page (max: 100)',
      type: Number,
      example: 10,
    }),
    ApiQuery({
      name: 'where[position]',
      required: false,
      description: 'Filter by player position',
      enum: Object.values(PlayerPosition),
      example: PlayerPosition.FORWARD,
    }),
    ApiQuery({
      name: 'where[isActive]',
      required: false,
      description: 'Filter by active status',
      type: Boolean,
      example: true,
    }),
    ApiQuery({
      name: 'where[nationality]',
      required: false,
      description: 'Filter by player nationality - 3-letter ISO country code',
      enum: VALID_NATIONALITIES,
    }),
    ApiQuery({
      name: 'search',
      required: false,
      description: 'Search players by name',
      type: String,
    }),
    ApiQuery({
      name: 'sort[by]',
      required: false,
      description: 'Sort players by field',
      enum: ['name', 'age', 'position', 'marketValue', 'createdAt'],
      example: 'age',
    }),
    ApiQuery({
      name: 'sort[order]',
      required: false,
      description: 'Sort order',
      enum: SortOrder,
      example: SortOrder.ASC,
    }),

    ApiOkResponse({ description: 'Players retrieved successfully' }),
  );

export const GetPlayerById = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get a player by ID' }),
    ApiParam({ name: 'id', description: 'Player ID' }),
    ApiOkResponse({ description: 'Player retrieved successfully' }),
    ApiNotFoundResponse({ description: 'Player not found' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );

export const UpdatePlayer = () =>
  applyDecorators(
    ApiOperation({ summary: 'Update a player' }),
    ApiParam({ name: 'id', description: 'Player ID' }),
    PlayerApiBody('update'),
    ApiOkResponse({ description: 'Player updated successfully' }),
    ApiNotFoundResponse({ description: 'Player not found' }),
    ApiBadRequestResponse({ description: 'Invalid input data' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );

export const DeletePlayer = () =>
  applyDecorators(
    ApiOperation({ summary: 'Delete a player' }),
    ApiParam({ name: 'id', description: 'Player ID' }),
    ApiNoContentResponse({ description: 'Player deleted successfully' }),
    ApiNotFoundResponse({ description: 'Player not found' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );

export const UploadPlayerImage = () =>
  applyDecorators(
    ApiOperation({ summary: 'Upload player image' }),
    ApiParam({ name: 'id', description: 'Player ID' }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      description: 'Player image file',
      schema: {
        type: 'object',
        properties: {
          image: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    }),
    ApiOkResponse({ description: 'Image uploaded successfully' }),
    ApiNotFoundResponse({ description: 'Player not found' }),
    ApiBadRequestResponse({ description: 'Invalid file format' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
