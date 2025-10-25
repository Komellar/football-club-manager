import {
  FindManyOptions,
  ILike,
  In,
  Not,
  MoreThan,
  LessThan,
  MoreThanOrEqual,
  LessThanOrEqual,
  Between,
  Repository,
  ObjectLiteral,
  And,
  FindOperator,
  Equal,
} from 'typeorm';
import {
  CompareOperator,
  FilterMode,
  SortOrder,
  type Comparable,
  type FilterOptions,
  type SearchOptions,
  type ListQueryParams,
  type PaginationResult,
  type PaginationMeta,
  type SortParams,
} from '@repo/core';

export class ListQueryBuilder {
  private static readonly DEFAULT_PAGE = 1;
  private static readonly DEFAULT_LIMIT = 10;
  private static readonly DEFAULT_FILTER_MODE = FilterMode.PARTIAL;

  static async executeQuery<T extends ObjectLiteral, Q>(
    repository: Repository<T>,
    queryDto?: Partial<Q & ListQueryParams>,
    filterOptions?: FilterOptions,
    relations?: string[],
  ): Promise<PaginationResult<T>> {
    const page = queryDto?.page || this.DEFAULT_PAGE;
    const limit = queryDto?.limit || this.DEFAULT_LIMIT;

    const typeormQuery = this.buildTypeOrmQuery(
      page,
      limit,
      queryDto,
      filterOptions,
      relations,
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
    queryDto?: Partial<T & ListQueryParams>,
    filterOptions?: FilterOptions,
    relations?: string[],
  ): FindManyOptions {
    if (!queryDto) {
      return {
        skip: (page - 1) * limit,
        take: limit,
        ...(relations && { relations }),
      };
    }

    const whereClause =
      ((queryDto as Record<string, unknown>)?.where as Record<
        string,
        unknown
      >) || {};

    const processedWhere = this.processFilters(whereClause, filterOptions);

    const finalWhere = this.addSearchToWhere(
      processedWhere,
      queryDto.search,
      filterOptions?.searchOptions,
    );

    const order = this.buildOrderClause(queryDto.sort);

    return {
      where: finalWhere,
      order,
      skip: (page - 1) * limit,
      take: limit,
      ...(relations && { relations }),
    };
  }

  private static processFilters(
    filters: Record<string, unknown>,
    options?: FilterOptions,
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    const flatFilters = this.flattenFilters(filters);

    const filterModes = options?.filterModes || {};
    const defaultMode = options?.defaultFilterMode || this.DEFAULT_FILTER_MODE;

    Object.entries(flatFilters).forEach(([key, value]) => {
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
      case FilterMode.BETWEEN:
        return { [CompareOperator.BETWEEN]: value };
      default:
        return { [CompareOperator.EQ]: value };
    }
  }

  private static buildFilterOperator(
    comparable: Comparable<unknown>,
    mode: FilterMode,
  ): unknown {
    const operators = Object.entries(comparable);
    const conditions = operators.map(([operator, value]) =>
      this.buildSingleOperator(operator as CompareOperator, value, mode),
    );

    if (conditions.length === 0) {
      return undefined;
    }
    if (conditions.length === 1) {
      return conditions[0];
    }

    return And(...conditions.map((c) => c));
  }

  private static buildSingleOperator(
    operator: CompareOperator,
    value: unknown,
    mode: FilterMode,
  ): FindOperator<unknown> {
    if (operator === CompareOperator.BETWEEN) {
      if (!Array.isArray(value) || value.length !== 2) {
        throw new Error(
          'BETWEEN operator requires an array of exactly 2 values [min, max]',
        );
      }
      return Between(value[0], value[1]);
    }

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
        return this.buildEqualityOperator(value, mode);
    }
  }

  private static buildEqualityOperator(
    value: unknown,
    mode: FilterMode,
  ): FindOperator<unknown> {
    if (typeof value !== 'string' || mode === FilterMode.EXACT) {
      return Equal(value);
    }

    return ILike(`%${String(value)}%`);
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

  private static buildOrderClause(
    sort?: SortParams,
  ): Record<string, SortOrder> | undefined {
    if (!sort?.by) {
      return undefined;
    }

    return { [sort.by]: sort.order || SortOrder.ASC };
  }

  private static buildPagination(
    page: number,
    limit: number,
    total: number,
  ): PaginationMeta {
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
