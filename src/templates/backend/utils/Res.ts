export function getRes() {
  return `// Elysia + Drizzle 统一响应格式工具文件

import { t } from "elysia";

/**
 * 前端用的响应类型定义
 * 错误也使用这个
 */
export type CommonRes<T> = {
  code: number;
  message: string;
  data: T;
};

/**
 * // 成功响应函数
 * 错误也使用这个响应函数
 * @param data 数据
 * @param code
 * @param message
 * @returns
 */
export function commonRes<T>(
  data: T,
  code = 200,
  message = "操作成功",
): CommonRes<T> {
  return {
    code,
    message,
    data,
  };
}

/**
 * 分页查询参数的 Zod 类型定义
 */
export const PaginationQuery = t.Object({
  page: t.Optional(t.Number()),
  limit: t.Optional(t.Number()),
});

export type PaginationQueryType = typeof PaginationQuery.static;
/**
 * 分页元数据 Zod 类型定义
 */
export const PageMeta = t.Object({
  total: t.Number(),
  page: t.Number(),
  limit: t.Number(),
  totalPages: t.Number(),
});
export type PageMeta = typeof PageMeta.static;
export interface PageData<T> {
  items: T[]; // 当前页数据
  meta: PageMeta;
}

/**
 * 前端用的分页响应类型定义
 */
export type PageRes<T> = {
  code: number;
  message: string;
  data: PageData<T>;
};
// ==================== 响应函数 ====================

/**
 * 创建符合项目规范的分页响应
 * 复用 pageRes 函数
 * @param data 数据数组
 * @param total 总数
 * @param page 当前页码
 * @param limit 每页大小
 * @param message 响应消息
 * @returns 符合项目规范的分页响应
 */
export function pageRes<T>(
  data: T[],
  total: number,
  page = 1,
  limit = 10,
  message = "获取成功",
) {
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
}
`;
}