import { PaginationMeta } from "@repo/core";

export function parsePaginationFromQuery(query: string): {
  page: number;
  limit: number;
} {
  const params = new URLSearchParams(query);
  const page = Math.max(Number(params.get("page")), 1);

  let limit = Number(params.get("limit")) || 10;
  limit = limit < 1 ? 10 : limit;

  return { page, limit };
}

export function updateQueryWithPagination(
  current: URLSearchParams,
  page: number,
  limit: number
): string {
  current.set("page", page.toString());
  current.set("limit", limit.toString());

  return current.toString();
}

export function getPaginationDisplayInfo(pagination: PaginationMeta): {
  startItem: number;
  endItem: number;
} {
  const { page, limit, total } = pagination;
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return { startItem, endItem };
}

export function getVisiblePageNumbers(
  currentPage: number,
  totalPages: number,
  maxVisible: number = 5
): number[] {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: number[] = [];
  const half = Math.floor(maxVisible / 2);

  let start = Math.max(1, currentPage - half);
  let end = Math.min(totalPages, start + maxVisible - 1);

  // Adjust start if we're near the end
  if (end === totalPages) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
}
