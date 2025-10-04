import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PlayerStatisticsApiBody } from './player-statistics-api.decorators';

/**
 * Composite decorator for GET /statistics - Get all player statistics with filtering
 */
export const GetAllPlayerStatistics = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get all player statistics',
      description:
        'Retrieves a paginated list of player statistics with optional filtering',
    }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Page number (default: 1)',
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Items per page (default: 10)',
    }),
    ApiQuery({
      name: 'playerId',
      required: false,
      type: Number,
      description: 'Filter by player ID',
    }),
    ApiQuery({
      name: 'season',
      required: false,
      type: String,
      description: 'Filter by season',
    }),
    ApiResponse({
      status: 200,
      description: 'Player statistics retrieved successfully',
    }),
    ApiResponse({
      status: 401,
      description: 'Authentication required',
    }),
  );

/**
 * Composite decorator for GET /statistics/:id - Get player statistics by ID
 */
export const GetPlayerStatisticsById = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get player statistics by ID',
      description:
        'Retrieves specific player statistics by their unique identifier',
    }),
    ApiParam({
      name: 'id',
      type: 'number',
      description: 'Player statistics unique identifier',
    }),
    ApiResponse({
      status: 200,
      description: 'Player statistics found and returned successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Player statistics not found',
    }),
    ApiResponse({
      status: 401,
      description: 'Authentication required',
    }),
  );

/**
 * Composite decorator for GET /statistics/player/:playerId - Get statistics for specific player
 */
export const GetStatisticsByPlayer = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get statistics for a specific player',
      description:
        'Retrieves all statistics for a specific player with optional filtering',
    }),
    ApiParam({
      name: 'playerId',
      type: 'number',
      description: 'Player unique identifier',
    }),
    ApiQuery({
      name: 'season',
      required: false,
      type: String,
      description: 'Filter by season',
    }),
    ApiResponse({
      status: 200,
      description: 'Player statistics retrieved successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Player not found',
    }),
    ApiResponse({
      status: 401,
      description: 'Authentication required',
    }),
  );

/**
 * Composite decorator for POST /statistics - Create new player statistics
 */
export const CreatePlayerStatistics = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Create new player statistics',
      description:
        'Creates a new player statistics record with the provided data',
    }),
    PlayerStatisticsApiBody('create'),
    ApiResponse({
      status: 201,
      description: 'Player statistics created successfully',
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid statistics data provided',
    }),
    ApiResponse({
      status: 401,
      description: 'Authentication required',
    }),
  );

/**
 * Composite decorator for PATCH /statistics/:id - Update player statistics
 */
export const UpdatePlayerStatistics = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Update player statistics',
      description: 'Updates existing player statistics with partial data',
    }),
    ApiParam({
      name: 'id',
      type: 'number',
      description: 'Player statistics unique identifier',
    }),
    PlayerStatisticsApiBody('update'),
    ApiResponse({
      status: 200,
      description: 'Player statistics updated successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Player statistics not found',
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid update data provided',
    }),
    ApiResponse({
      status: 401,
      description: 'Authentication required',
    }),
  );

/**
 * Composite decorator for DELETE /statistics/:id - Delete player statistics
 */
export const DeletePlayerStatistics = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Delete player statistics',
      description: 'Permanently deletes a player statistics record',
    }),
    ApiParam({
      name: 'id',
      type: 'number',
      description: 'Player statistics unique identifier',
    }),
    ApiResponse({
      status: 204,
      description: 'Player statistics deleted successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Player statistics not found',
    }),
    ApiResponse({
      status: 401,
      description: 'Authentication required',
    }),
  );
