export function getCommonSchemas() {
  return `import { t } from "elysia";

/**
 * 通用分页查询 Schema
 */
export const PageQuerySchema = t.Object({
  page: t.Integer({ minimum: 1, default: 1 }),
  limit: t.Integer({ minimum: 1, maximum: 100, default: 10 }),
});

/**
 * 通用分页响应 Schema
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