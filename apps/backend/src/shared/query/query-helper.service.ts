import {
  FindManyOptions,
  ILike,
  In,
  Not,
  MoreThan,
  LessThan,
  MoreThanOrEqual,
  LessThanOrEqual,
  Repository,
  ObjectLiteral,
  And,
} from 'typeorm';
import {
  CompareOperator,
  FilterMode,
  type Comparable,
  type FilterOptions,
  type SearchOptions,
  type PaginationParams,
  type QueryPaginationResult as PaginationResult,
  type QueryPaginatedResponse as PaginatedResponse,
} from '@repo/core';

export class QueryHelper {
  private static readonly DEFAULT_PAGE = 1;
  private static readonly DEFAULT_LIMIT = 10;
  private static readonly NON_TYPEORM_PROPERTIES = [
    'page',
    'limit',
    'search',
    'sortBy',
    'sortOrder',
    'order',
    'where',
  ] as const;
  private static readonly DEFAULT_FILTER_MODE = FilterMode.PARTIAL;

  static async executeQuery<T extends ObjectLiteral, Q>(
    repository: Repository<T>,
    queryDto?: Partial<Q & PaginationParams>,
    filterOptions?: FilterOptions,
  ): Promise<PaginatedResponse<T>> {
    const page = queryDto?.page || this.DEFAULT_PAGE;
    const limit = queryDto?.limit || this.DEFAULT_LIMIT;

    const typeormQuery = this.buildTypeOrmQuery(
      page,
      limit,
      queryDto,
      filterOptions,
    );
    const [data, total] = await repository.findAndCount(typeormQuery);

    return {
      data,
      pagination: this.buildPagination(page, limit, total),
    };
  }

  private static buildTypeOrmQuery<T>(
    page: number,
    limit: number,
    queryDto?: Partial<T & PaginationParams>,
    filterOptions?: FilterOptions,
  ): FindManyOptions {
    if (!queryDto) {
      return { skip: (page - 1) * limit, take: limit };
    }

    const cleanQuery = { ...queryDto } as Record<string, any>;
    const searchTerm = queryDto.search;

    // Extract filters from nested 'where' object or use flat structure
    let filtersToProcess: Record<string, any>;
    if (cleanQuery.where && typeof cleanQuery.where === 'object') {
      filtersToProcess = cleanQuery.where;
    } else {
      filtersToProcess = { ...cleanQuery };
      // Remove non-TypeORM properties for flat structure
      this.NON_TYPEORM_PROPERTIES.forEach((prop) => delete filtersToProcess[prop]);
    }

    const processedWhere = this.processFilters(filtersToProcess, filterOptions);

    const finalWhere = this.addSearchToWhere(
      processedWhere,
      searchTerm,
      filterOptions?.searchOptions,
    );

    const order = this.buildOrderOptions(queryDto);

    return {
      where: finalWhere,
      skip: (page - 1) * limit,
      take: limit,
      order,
    };
  }

  private static processFilters(
    filters: Record<string, unknown>,
    options?: FilterOptions,
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    const flatFilters = this.flattenFilters(filters);

    const ignoredFilters = options?.ignoredFilters || [];
    const filterModes = options?.filterModes || {};
    const defaultMode = options?.defaultFilterMode || this.DEFAULT_FILTER_MODE;

    Object.entries(flatFilters).forEach(([key, value]) => {
      if (ignoredFilters.includes(key) || value == null) return;

      const mode = filterModes[key] || defaultMode;
      const comparable = this.toComparable(value, mode);

      result[key] = this.buildFilterOperator(comparable, mode);
    });

    return result;
  }

  private static flattenFilters(
    filters: Record<string, unknown>,
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    const process = (obj: Record<string, unknown>, path: string[] = []) => {
      Object.entries(obj).forEach(([key, value]) => {
        if (value == null) return;

        const currentPath = [...path, key];

        if (Array.isArray(value) || this.isComparable(value)) {
          result[currentPath.join('.')] = value;
        } else if (typeof value === 'object') {
          process(value as Record<string, unknown>, currentPath);
        } else {
          result[currentPath.join('.')] = value;
        }
      });
    };

    process(filters);
    return result;
  }

  private static isComparable(value: unknown): value is Comparable<unknown> {
    if (typeof value !== 'object' || value === null) return false;
    const firstKey = Object.keys(value)[0];
    return Object.values(CompareOperator).includes(firstKey as CompareOperator);
  }

  private static toComparable(
    value: unknown,
    mode: FilterMode,
  ): Comparable<unknown> {
    if (this.isComparable(value)) return value;

    // Map FilterMode to CompareOperator for direct field filtering
    switch (mode) {
      case FilterMode.GT:
        return { [CompareOperator.GT]: value };
      case FilterMode.LT:
        return { [CompareOperator.LT]: value };
      case FilterMode.GTE:
        return { [CompareOperator.GTE]: value };
      case FilterMode.LTE:
        return { [CompareOperator.LTE]: value };
      case FilterMode.NE:
        return { [CompareOperator.NE]: value };
      default:
        return { [CompareOperator.EQ]: value };
    }
  }

  private static buildFilterOperator(
    comparable: Comparable<unknown>,
    mode: FilterMode,
  ) {
    const operators = Object.entries(comparable);
    const conditions = operators
      .map(([operator, value]) =>
        this.buildSingleOperator(operator as CompareOperator, value, mode),
      )
      .filter((condition) => condition != null);

    return conditions.length > 1
      ? And(...(conditions as Parameters<typeof And>))
      : conditions[0];
  }

  private static buildSingleOperator(
    operator: CompareOperator,
    value: unknown,
    mode: FilterMode,
  ): unknown {
    if (Array.isArray(value)) {
      return operator === CompareOperator.EQ ? In(value) : Not(In(value));
    }

    switch (operator) {
      case CompareOperator.GT:
        return MoreThan(value);
      case CompareOperator.LT:
        return LessThan(value);
      case CompareOperator.GTE:
        return MoreThanOrEqual(value);
      case CompareOperator.LTE:
        return LessThanOrEqual(value);
      case CompareOperator.NE:
        return Not(value);
      case CompareOperator.EQ:
      default:
        if (mode === FilterMode.EXACT) {
          return value;
        } else {
          return ILike(`%${String(value)}%`);
        }
    }
  }

  private static addSearchToWhere(
    where: Record<string, unknown>,
    searchTerm?: string,
    searchOptions?: SearchOptions,
  ): Record<string, unknown> | Record<string, unknown>[] {
    if (
      !searchTerm?.trim() ||
      !searchOptions?.searchFields ||
      searchOptions.searchFields.length === 0
    ) {
      return where;
    }

    const searchMode = searchOptions.searchMode || FilterMode.PARTIAL;
    const trimmedSearchTerm = searchTerm.trim();

    // Filter out search fields that already have explicit filters
    // This prevents search from overriding user's specific filter choices
    const availableSearchFields = searchOptions.searchFields.filter(
      (field) => !(field in where),
    );

    if (availableSearchFields.length === 0) {
      return where;
    }

    const searchConditions = availableSearchFields.map((field) => ({
      [field]:
        searchMode === FilterMode.PARTIAL
          ? ILike(`%${trimmedSearchTerm}%`)
          : trimmedSearchTerm,
    }));

    return searchConditions.map((searchCondition) => ({
      ...where,
      ...searchCondition,
    }));
  }

  private static buildOrderOptions<T>(
    queryDto?: Partial<T & PaginationParams>,
  ): Record<string, 'ASC' | 'DESC'> | undefined {
    // Handle nested order structure
    if ((queryDto as any)?.order && typeof (queryDto as any).order === 'object') {
      return (queryDto as any).order;
    }
    
    // Handle flat structure
    if (!queryDto?.sortBy) {
      return undefined;
    }

    return {
      [queryDto.sortBy]: queryDto.sortOrder || 'DESC',
    };
  }

  private static buildPagination(
    page: number,
    limit: number,
    total: number,
  ): PaginationResult {
    const totalPages = Math.ceil(total / limit);
    return {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }
}
