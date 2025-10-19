export function getUsersService() {

  return `export abstract class UsersService {
  async getById(id: number) {
    throw new Error('getById not implemented');
  }
}`;
}
