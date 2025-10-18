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
 * Maps low-level database errors (like those thrown by Drizzle/PostgreSQL) to semantic custom errors
 */
export function mapDatabaseError(
  error: any,
): DatabaseError | DuplicateError | ValidationError | ServiceUnavailableError {
  const code = String(error?.code);
  const detail = error?.detail || error?.message || "Database operation failed";

  switch (code) {
    case "23505": // unique_violation
      return new DuplicateError(detail, error);
    case "23503": // foreign_key_violation
      return new ValidationError("Related data does not exist, please check data integrity", error);
    case "23502": // not_null_violation
      return new ValidationError("Required field cannot be empty", error);
    case "23514": // check_violation
      return new ValidationError("Data format is incorrect", error);
    case "08006": // connection_failure
      return new ServiceUnavailableError("Database connection failed, please try again later", error);
    case "28P01": // invalid_password
      return new DatabaseError("Database authentication failed", error);
    case "40P01": // deadlock_detected
      return new DatabaseError("Database deadlock, please retry", error);
    case "57014": // query_canceled
      return new DatabaseError("Database operation timed out", error);
    default:
      return new DatabaseError(detail, error);
  }
}

/**
 * Convenience function for handling database errors
 * If the error is already a custom error, throw it directly
 * Otherwise, convert it using mapDatabaseError and throw
 */
export function handleDatabaseError(error: any): never {
  // If already a custom error, throw it directly
  if (error instanceof CustomError) {
    throw error;
  }

  // If it's a database error, map it
  if (isDatabaseError(error)) {
    throw mapDatabaseError(error);
  }

  // Other unknown errors, wrap as DatabaseError
  throw new DatabaseError("Database operation failed", error);
}
`;
}