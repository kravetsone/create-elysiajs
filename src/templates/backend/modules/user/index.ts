export function getUserModuleIndex() {
	return `// User module unified export
export { usersController } from "./users.controller";

export { UsersService } from "./users.service";
`;
}
