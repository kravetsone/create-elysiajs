export function getErrorIndex() {
	return `// src/errors/index.ts
export { CustomError } from "./base";
// 工具函数
export { handleDatabaseError, mapDatabaseError } from "./database-error-mapper";
export { isDatabaseError } from "./guards";
// 导出所有具体错误类（用于 Elysia.error()）
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
