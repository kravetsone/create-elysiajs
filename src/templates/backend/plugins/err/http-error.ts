export function getHttpErrors() {
  return `// src/errors/http-errors.ts
import { CustomError } from "./base";

export class ValidationError extends CustomError {
  constructor(message = "数据验证失败", originalError?: unknown) {
    super(message, 400, originalError);
  }
}

export class NotFoundError extends CustomError {
  constructor(message = "记录不存在", originalError?: unknown) {
    super(message, 404, originalError);
  }
}

export class AuthenticationError extends CustomError {
  constructor(message = "认证失败", originalError?: unknown) {
    super(message, 401, originalError);
  }
}

export class AuthorizationError extends CustomError {
  constructor(message = "权限不足", originalError?: unknown) {
    super(message, 403, originalError);
  }
}

export class DuplicateError extends CustomError {
  constructor(message = "数据已存在", originalError?: unknown) {
    super(message, 409, originalError);
  }
}

export class BusinessError extends CustomError {
  constructor(message = "业务逻辑错误", originalError?: unknown) {
    super(message, 400, originalError);
  }
}

export class ServiceUnavailableError extends CustomError {
  constructor(message = "服务暂时不可用", originalError?: unknown) {
    super(message, 503, originalError);
  }
}

export class InternalServerError extends CustomError {
  constructor(message = "服务器内部错误", originalError?: unknown) {
    super(message, 500, originalError);
  }
}

export class DatabaseError extends CustomError {
  constructor(message: string = "数据库操作失败", originalError?: any) {
    super(message, 500, originalError);
  }
}
`;
}