export function getErrorIndex() {
	return `// src/errors/index.ts
export { CustomError } from "./base";
// Utility functions
export { handleDatabaseError, mapDatabaseError } from "./database-error-mapper";
export { isDatabaseError } from "./guards";
// Export all specific error classes (for Elysia.error())
export {
	AuthenticationError,
	AuthorizationError,
	BusinessError,
	DatabaseError,
	DuplicateError,
	InternalServerError,
	NotFoundError,
	ServiceUnavailableError,
	ValidationError,
} from "./http-error";`;
}
