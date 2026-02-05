export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function getPaginationParams(searchParams: Record<string, string>): PaginationParams {
  const page = parseInt(searchParams.page || '1', 10);
  const limit = parseInt(searchParams.limit || '10', 10);

  return {
    page: Math.max(1, page),
    limit: Math.max(1, Math.min(limit, 100))
  };
}

export function getPaginationOffsetLimit(page: number, limit: number) {
  return {
    offset: (page - 1) * limit,
    limit
  };
}
