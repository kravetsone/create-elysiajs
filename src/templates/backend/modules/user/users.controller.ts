export function getUsersController() {
  return `import Elysia from "elysia";
import { commonRes } from "../../utils/Res";

/**
 * User management controller
 * Handles user-related HTTP requests
 */
export const usersController = new Elysia({
  prefix: "/users",
  tags: ["user management"],
})

  .get("/ping", () => {
    return commonRes("pong");
  }, {
    detail: {
      summary: "healthyCheck",    }
  });
`;
}
