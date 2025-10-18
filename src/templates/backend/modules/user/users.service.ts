export function getUsersService() {
	return `export abstract class UsersService {
  static async getById(id: number) {
    return 'xxx'
  }
}`;
}
