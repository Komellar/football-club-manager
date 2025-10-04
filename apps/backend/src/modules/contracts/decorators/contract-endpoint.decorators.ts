import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { ContractApiBody } from './contract-api.decorators';

/**
 * Composite decorators for Contracts endpoints
 * These combine multiple decorators into single, meaningful ones
 */

export const CreateContract = () =>
  applyDecorators(
    ApiOperation({ summary: 'Create a new contract' }),
    ContractApiBody('create'),
    ApiCreatedResponse({ description: 'Contract created successfully' }),
    ApiResponse({ status: 400, description: 'Invalid input data' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );

export const GetAllContracts = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get all contracts with optional filtering and pagination',
    }),
    ApiQuery({ name: 'page', required: false, description: 'Page number' }),
    ApiQuery({ name: 'limit', required: false, description: 'Items per page' }),
    ApiQuery({
      name: 'search',
      required: false,
      description: 'Search contracts',
    }),
    ApiOkResponse({ description: 'Contracts retrieved successfully' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );

export const GetContractById = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get a contract by ID' }),
    ApiParam({ name: 'id', description: 'Contract ID' }),
    ApiOkResponse({ description: 'Contract retrieved successfully' }),
    ApiResponse({ status: 404, description: 'Contract not found' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );

export const UpdateContract = () =>
  applyDecorators(
    ApiOperation({ summary: 'Update a contract' }),
    ApiParam({ name: 'id', description: 'Contract ID' }),
    ContractApiBody('update'),
    ApiOkResponse({ description: 'Contract updated successfully' }),
    ApiResponse({ status: 404, description: 'Contract not found' }),
    ApiResponse({ status: 400, description: 'Invalid input data' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );

export const DeleteContract = () =>
  applyDecorators(
    ApiOperation({ summary: 'Delete a contract' }),
    ApiParam({ name: 'id', description: 'Contract ID' }),
    ApiResponse({ status: 204, description: 'Contract deleted successfully' }),
    ApiResponse({ status: 404, description: 'Contract not found' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
