export function getRes() {
	return `// Elysia + Drizzle Unified Response Format Utility

import { t } from "elysia";

/**
 * Frontend response type definition
 * Errors also use this type
 */
export type CommonRes<T> = {
  code: number;
  message: string;
  data: T;
};

/**
 * Success response function
 * Errors also use this response function
 * @param data Response data
 * @param code Response code
 * @param message Response message
 * @returns Unified response object
 */
export function commonRes<T>(
  data: T,
  code = 200,
  message = "Success",
): CommonRes<T> {
  return {
    code,
    message,
    data,
  };
}

/**
 *  Pagination query parameters Elysia type definition
 */
export const PaginationQuery = t.Object({
  page: t.Optional(t.Number({ minimum: 1 })),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
});

export type PaginationQueryType = typeof PaginationQuery.static;
/**
 * Pagination metadata Elysia type definition
 */
export const PageMeta = t.Object({
  total: t.Number(),
  page: t.Number(),
  limit: t.Number(),
  totalPages: t.Number(),
});
export type PageMeta = typeof PageMeta.static;
export interface PageData<T> {
  items: T[]; // Current page data
  meta: PageMeta;
}

/**
 * Frontend pagination response type definition
 */
export type PageRes<T> = {
  code: number;
  message: string;
  data: PageData<T>;
};
// ==================== Response Functions ====================

/**
 * Create paginated response following project standards
 * Reuses pageRes function
 * @param data Data array
 * @param total Total count
 * @param page Current page number
 * @param limit Page size
 * @param message Response message
 * @returns Paginated response following project standards
 */
export function pageRes<T>(
  data: T[],
  total: number,
  page = 1,
  limit = 10,
  message = "Data retrieved successfully",
) {
  if (limit <= 0) {
    throw new Error("limit must be greater than 0");
  }
  return commonRes(
    {
      items: data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
    200,
    message,
  );
}`;
}
