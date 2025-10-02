// Query comparison operators for filtering
export enum CompareOperator {
  EQ = "_eq",
  GT = "_gt",
  LT = "_lt",
  GTE = "_gte",
  LTE = "_lte",
  NE = "_ne",
}

// Filter modes for text matching and comparisons
export enum FilterMode {
  PARTIAL = "partial",
  EXACT = "exact",
  GT = "gt",
  LT = "lt",
  GTE = "gte",
  LTE = "lte",
  NE = "ne",
}

// Comparable type for advanced filtering
export type Comparable<T> = {
  [K in CompareOperator]?: T | T[];
};

// Search configuration
export interface SearchOptions {
  searchFields: string[];
  searchMode?: FilterMode;
}

// Filter options for query processing
export interface FilterOptions {
  ignoredFilters?: string[];
  filterModes?: Record<string, FilterMode>;
  defaultFilterMode?: FilterMode;
  searchOptions?: SearchOptions;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface QueryPaginationResult {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface QueryPaginatedResponse<T> {
  data: T[];
  pagination: QueryPaginationResult;
}

// Legacy query parameters (for backward compatibility)
export interface QueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  search?: string;
}
