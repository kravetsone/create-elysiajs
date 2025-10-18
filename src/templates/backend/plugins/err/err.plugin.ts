export function getErrorPlugin() {
  return `// src/plugins/errorHandler.ts
import { Elysia } from "elysia";
import * as HttpError from "./http-error";
import * as Errors from "./index";
export const errorHandler = new Elysia()
  .error(HttpError) // 注册所有自定义错误类
  .onError(({ code, error, path }) => {
    // 1. 已注册的自定义错误（如 ValidationError）
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
          // ⚠️ 生产环境不要暴露 originalError
          // ...(process.env.NODE_ENV === 'development' && { debug: err.originalError }),
        },
        { status: err.status },
      );
    }

    // 2. 数据库错误（未被包装的原始错误）
    if (Errors.isDatabaseError(error)) {
      console.log("DBError:", error);
      const mapped = Errors.mapDatabaseError(error);
      console.log(\`[DBError \${error.code}] \${path}:\`, error);
      return Response.json(
        { status: mapped.status, message: mapped.message, data: null },
        { status: mapped.status },
      );
    }

    // 3. 其他未知错误（500）
    console.log(\`[InternalServerError] \${path}:\`, error);
    return Response.json(
      { status: 500, message: "服务器内部错误", data: null },
      { status: 500 },
    );
  })
  .as("global");
`;
}