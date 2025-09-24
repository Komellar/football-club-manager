import { SelectQueryBuilder } from 'typeorm';
import { PaginationResult } from '@repo/core';

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export class PaginationHelper {
  static async paginate<T extends Record<string, any>>(
    queryBuilder: SelectQueryBuilder<T>,
    options: PaginationOptions = {},
  ): Promise<PaginationResult<T>> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
    };
  }
}
