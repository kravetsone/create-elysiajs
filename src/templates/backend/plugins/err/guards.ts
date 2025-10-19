export function getErrorGuards() {
  return `// src/errors/guards.ts
import { CustomError } from "./base";

/**
 * Check if it's a PostgreSQL/Drizzle style database error
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
 * Check if it's a custom error (optional, usually using code in Errors is simpler)
 */
// export function isCustomError(error: unknown): error is CustomError {
//   return error instanceof CustomError;
// }
`;
}