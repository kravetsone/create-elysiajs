export function getUserModuleIndex() {
	return `// 用户模块统一导出
export { usersController } from "./users.controller";

export { UsersService } from "./users.service";
`;
}
