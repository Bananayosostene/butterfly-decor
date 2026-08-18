export type PaginationMeta = { page: number; limit: number; total: number; totalPages: number };

/** Returns null when the request didn't ask for pagination — callers should fall back to their existing unpaginated behavior. */
export function parsePagination(searchParams: URLSearchParams, defaultLimit = 12, maxLimit = 100) {
  const pageParam = searchParams.get("page");
  if (!pageParam) return null;
  const page = Math.max(1, parseInt(pageParam, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(searchParams.get("limit") || "", 10) || defaultLimit));
  return { page, limit, skip: (page - 1) * limit };
}

export function buildMeta(page: number, limit: number, total: number): PaginationMeta {
  return { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}
