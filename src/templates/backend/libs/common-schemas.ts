export function getCommonSchemas() {
  return `import { t } from "elysia";

/**
 * Common pagination query Schema
 */
export const PageQuerySchema = t.Object({
  page: t.Integer({ minimum: 1, default: 1 }),
  limit: t.Integer({ minimum: 1, maximum: 100, default: 10 }),
});

/**
 * Common pagination response Schema
 */
export const PageResponseSchema = t.Object({
  data: t.Array(t.Any()),
  total: t.Integer(),
  page: t.Integer(),
  limit: t.Integer(),
  totalPages: t.Integer(),
});
`;
}