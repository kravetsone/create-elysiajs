export function getDatabaseErrorMapper() {
  return `// src/errors/database-error-mapper.ts

import { CustomError } from "./base";
import { isDatabaseError } from "./guards";
import {
  DatabaseError,
  DuplicateError,
  ServiceUnavailableError,
  ValidationError,
} from "./http-error";

/**
 * 将底层数据库错误（如 Drizzle/PostgreSQL 抛出的）映射为语义化自定义错误
 */
export function mapDatabaseError(
  error: any,
): DatabaseError | DuplicateError | ValidationError | ServiceUnavailableError {
  const code = String(error?.code);
  const detail = error?.detail || error?.message || "数据库操作失败";

  switch (code) {
    case "23505": // unique_violation
      return new DuplicateError(detail, error);
    case "23503": // foreign_key_violation
      return new ValidationError("关联数据不存在，请检查数据完整性", error);
    case "23502": // not_null_violation
      return new ValidationError("必填字段不能为空", error);
    case "23514": // check_violation
      return new ValidationError("数据格式不正确", error);
    case "08006": // connection_failure
      return new ServiceUnavailableError("数据库连接失败，请稍后重试", error);
    case "28P01": // invalid_password
      return new DatabaseError("数据库认证失败", error);
    case "40P01": // deadlock_detected
      return new DatabaseError("数据库死锁，请重试", error);
    case "57014": // query_canceled
      return new DatabaseError("数据库操作超时", error);
    default:
      return new DatabaseError(detail, error);
  }
}

/**
 * 处理数据库错误的便捷函数
 * 如果错误已经是自定义错误，直接抛出
 * 否则使用 mapDatabaseError 转换后抛出
 */
export function handleDatabaseError(error: any): never {
  // 如果已经是自定义错误，直接抛出
  if (error instanceof CustomError) {
    throw error;
  }

  // 如果是数据库错误，进行映射
  if (isDatabaseError(error)) {
    throw mapDatabaseError(error);
  }

  // 其他未知错误，包装为 DatabaseError
  throw new DatabaseError("数据库操作失败", error);
}
`;
}