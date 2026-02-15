import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { SponsorshipApiBody } from './sponsorship-api.decorators';

/**
 * Composite decorator for POST /sponsorships - Create new sponsorship
 */
export const CreateSponsorship = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Create a new sponsorship',
      description: 'Creates a new sponsorship record with the provided data',
    }),
    SponsorshipApiBody('create'),
    ApiResponse({
      status: 201,
      description: 'Sponsorship created successfully',
    }),
    ApiResponse({
      status: 400,
      description:
        'Invalid sponsorship data provided or overlapping sponsorship exists',
    }),
    ApiResponse({
      status: 401,
      description: 'Authentication required',
    }),
  );

/**
 * Composite decorator for GET /sponsorships - Get all sponsorships with filtering
 */
export const GetAllSponsorships = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get all sponsorships',
      description:
        'Retrieves a paginated list of sponsorships with optional filtering',
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
      name: 'sponsorName',
      required: false,
      type: String,
      description: 'Filter by sponsor name (partial match)',
    }),
    ApiQuery({
      name: 'sponsorshipType',
      required: false,
      type: String,
      description: 'Filter by sponsorship type',
    }),
    ApiQuery({
      name: 'sponsorshipStatus',
      required: false,
      type: String,
      description: 'Filter by sponsorship status',
    }),
    ApiQuery({
      name: 'sortBy',
      required: false,
      type: String,
      description: 'Field to sort by',
      example: 'startDate',
    }),
    ApiQuery({
      name: 'sortOrder',
      required: false,
      enum: ['asc', 'desc'],
      description: 'Sort order',
      example: 'desc',
    }),
    ApiResponse({
      status: 200,
      description: 'Sponsorships retrieved successfully',
    }),
    ApiResponse({
      status: 401,
      description: 'Authentication required',
    }),
  );

/**
 * Composite decorator for GET /sponsorships/:id - Get sponsorship by ID
 */
export const GetSponsorshipById = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get sponsorship by ID',
      description: 'Retrieves a specific sponsorship by its unique identifier',
    }),
    ApiParam({
      name: 'id',
      type: 'number',
      description: 'Sponsorship unique identifier',
    }),
    ApiResponse({
      status: 200,
      description: 'Sponsorship found and returned successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Sponsorship not found',
    }),
    ApiResponse({
      status: 401,
      description: 'Authentication required',
    }),
  );

/**
 * Composite decorator for PATCH /sponsorships/:id - Update sponsorship
 */
export const UpdateSponsorship = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Update sponsorship',
      description:
        'Updates an existing sponsorship with the provided data. Only provided fields will be updated.',
    }),
    ApiParam({
      name: 'id',
      type: 'number',
      description: 'Sponsorship unique identifier',
    }),
    SponsorshipApiBody('update'),
    ApiResponse({
      status: 200,
      description: 'Sponsorship updated successfully',
    }),
    ApiResponse({
      status: 400,
      description:
        'Invalid sponsorship data provided or overlapping sponsorship exists',
    }),
    ApiResponse({
      status: 404,
      description: 'Sponsorship not found',
    }),
    ApiResponse({
      status: 401,
      description: 'Authentication required',
    }),
  );

/**
 * Composite decorator for DELETE /sponsorships/:id - Delete sponsorship
 */
export const DeleteSponsorship = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Delete sponsorship',
      description: 'Permanently deletes a sponsorship record from the database',
    }),
    ApiParam({
      name: 'id',
      type: 'number',
      description: 'Sponsorship unique identifier',
    }),
    ApiResponse({
      status: 204,
      description: 'Sponsorship deleted successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Sponsorship not found',
    }),
    ApiResponse({
      status: 401,
      description: 'Authentication required',
    }),
  );
