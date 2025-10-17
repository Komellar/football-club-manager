import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { TransferApiBody } from './transfer-api.decorators';

/**
 * Composite decorator for POST /transfers - Create new transfer
 */
export const CreateTransfer = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Create a new transfer',
      description: 'Creates a new transfer record with the provided data',
    }),
    TransferApiBody('create'),
    ApiResponse({
      status: 201,
      description: 'Transfer created successfully',
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid transfer data provided',
    }),
    ApiResponse({
      status: 401,
      description: 'Authentication required',
    }),
  );

/**
 * Composite decorator for GET /transfers - Get all transfers with filtering
 */
export const GetAllTransfers = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get all transfers',
      description:
        'Retrieves a paginated list of transfers with optional filtering',
    }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Page number',
      example: 1,
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Items per page',
      example: 10,
    }),
    ApiQuery({
      name: 'playerId',
      required: false,
      type: Number,
      description: 'Filter by player ID',
    }),
    ApiQuery({
      name: 'fromClub',
      required: false,
      type: Number,
      description: 'Filter by source club',
    }),
    ApiQuery({
      name: 'toClub',
      required: false,
      type: Number,
      description: 'Filter by destination club',
    }),
    ApiResponse({
      status: 200,
      description: 'Transfers retrieved successfully',
    }),
    ApiResponse({
      status: 401,
      description: 'Authentication required',
    }),
  );

/**
 * Composite decorator for GET /transfers/:id - Get transfer by ID
 */
export const GetTransferById = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get transfer by ID',
      description: 'Retrieves a specific transfer by their unique identifier',
    }),
    ApiParam({
      name: 'id',
      type: 'number',
      description: 'Transfer unique identifier',
    }),
    ApiResponse({
      status: 200,
      description: 'Transfer found and returned successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Transfer not found',
    }),
    ApiResponse({
      status: 401,
      description: 'Authentication required',
    }),
  );

/**
 * Composite decorator for PATCH /transfers/:id - Update transfer
 */
export const UpdateTransfer = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Update transfer',
      description: 'Updates an existing transfer with partial data',
    }),
    ApiParam({
      name: 'id',
      type: 'number',
      description: 'Transfer unique identifier',
    }),
    TransferApiBody('update'),
    ApiResponse({
      status: 200,
      description: 'Transfer updated successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Transfer not found',
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
 * Composite decorator for DELETE /transfers/:id - Delete transfer
 */
export const DeleteTransfer = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Delete transfer',
      description: 'Permanently deletes a transfer record',
    }),
    ApiParam({
      name: 'id',
      type: 'number',
      description: 'Transfer unique identifier',
    }),
    ApiResponse({
      status: 204,
      description: 'Transfer deleted successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Transfer not found',
    }),
    ApiResponse({
      status: 401,
      description: 'Authentication required',
    }),
  );

/**
 * Composite decorator for GET /transfers/player/:playerId - Get player transfer history
 */
export const GetPlayerTransferHistory = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get player transfer history',
      description:
        'Retrieves the complete transfer history for a specific player',
    }),
    ApiParam({
      name: 'playerId',
      type: 'number',
      description: 'Player unique identifier',
    }),
    ApiResponse({
      status: 200,
      description: 'Player transfer history retrieved successfully',
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
