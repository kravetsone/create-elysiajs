export function getErrorPlugin() {
  return `// src/plugins/errorHandler.ts
import { Elysia } from "elysia";
import * as HttpError from "./http-error";
import * as Errors from "./index";
export const errorHandler = new Elysia()
  .error(HttpError) // Register all custom error classes
  .onError(({ code, error, path }) => {
    // 1. Registered custom errors (like ValidationError)
    if (error instanceof Errors.CustomError) {
      const err = error as Errors.CustomError;
      if (process.env.NODE_ENV === "development") {
        console.log(
          \`[AppError \${err.status}] \${path}:\`,
          err.message,
          err.originalError,
        );
      }

      return Response.json(
        {
          status: err.status,
          message: err.message,
          data: null,
          // ⚠️ Don't expose originalError in production
          // ...(process.env.NODE_ENV === 'development' && { debug: err.originalError }),
        },
        { status: err.status },
      );
    }

    // 2. Database errors (unwrapped original errors)
    if (Errors.isDatabaseError(error)) {
      const mapped = Errors.mapDatabaseError(error);
     console.log(\`[DBError \${error.code}] \${path}:\`, error);
      return Response.json(
        { status: mapped.status, message: mapped.message, data: null },
        { status: mapped.status },
      );
    }

    // 3. Other unknown errors (500)
    console.log(\`[InternalServerError] \${path}:\`, error);
    return Response.json(
      { status: 500, message: "Internal server error", data: null },
      { status: 500 },
    );
  })
  .as("global");
`;
}