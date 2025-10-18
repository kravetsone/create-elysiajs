export function getErrorGuards() {
  return `// src/errors/guards.ts
import { CustomError } from "./base";

/**
 * 判断是否为 PostgreSQL/Drizzle 风格的数据库错误
 */
export function isDatabaseError(
  error: unknown,
): error is { code: string; detail?: string } {
  return (
    error != null &&
    typeof error === "object" &&
    "code" in error &&
    typeof (error as any).code === "string"
  );
}

/**
 * 判断是否为自定义错误（可选，通常用 code in Errors 更简单）
 */
// export function isCustomError(error: unknown): error is CustomError {
//   return error instanceof CustomError;
// }
`;
}