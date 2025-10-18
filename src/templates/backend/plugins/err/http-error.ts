export function getHttpErrors() {
  return `// src/errors/http-errors.ts
import { CustomError } from "./base";

export class ValidationError extends CustomError {
  constructor(message = "Data validation failed", originalError?: unknown) {
    super(message, 400, originalError);
  }
}

export class NotFoundError extends CustomError {
  constructor(message = "Record not found", originalError?: unknown) {
    super(message, 404, originalError);
  }
}

export class AuthenticationError extends CustomError {
  constructor(message = "Authentication failed", originalError?: unknown) {
    super(message, 401, originalError);
  }
}

export class AuthorizationError extends CustomError {
  constructor(message = "Insufficient permissions", originalError?: unknown) {
    super(message, 403, originalError);
  }
}

export class DuplicateError extends CustomError {
  constructor(message = "Data already exists", originalError?: unknown) {
    super(message, 409, originalError);
  }
}

export class BusinessError extends CustomError {
  constructor(message = "Business logic error", originalError?: unknown) {
    super(message, 400, originalError);
  }
}

export class ServiceUnavailableError extends CustomError {
  constructor(message = "Service temporarily unavailable", originalError?: unknown) {
    super(message, 503, originalError);
  }
}

export class InternalServerError extends CustomError {
  constructor(message = "Internal server error", originalError?: unknown) {
    super(message, 500, originalError);
  }
}

export class DatabaseError extends CustomError {
  constructor(message: string = "Database operation failed", originalError?: unknown) {
    super(message, 500, originalError);
  }
}`;
}