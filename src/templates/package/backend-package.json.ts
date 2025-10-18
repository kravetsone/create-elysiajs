import { dependencies } from "../../deps";
import { ShareDeps } from "../../deps.share";
import { type Preferences, pmExecuteMap } from "../../utils";

export function getBackendPackageJson({
  projectName,
  packageManager,
  orm,
  driver,
  others,
  plugins,
  redis,
  mockWithPGLite,
  telegramRelated,
  s3Client,
}: Preferences) {
  const sample = {
    name: `@${projectName}/backend`,
    version: "0.0.1",
    module: "index.ts",
    type: "module",
    private: true,
    scripts: {
      build:
        "rimraf dist && NODE_ENV=production bun build --target bun --minify-whitespace --minify-syntax --outfile ./dist/index.js src/index.ts",
      dev: "bun --watch src/index.ts",
      clean: "rimraf dist node_modules",
      "type-check": "bun --bun tsc --noEmit",
      lint: "biome check",
      "lint:fix": "biome check --write",
      start: "bun --env-file=.env --env-file=.env.production ./dist/index.js",
    } as Record<string, string>,
    dependencies: {
      elysia: ShareDeps.elysia,
      "env-var": dependencies["env-var"],
    } as Record<string, string>,
    devDependencies: {
      "@repo/tsconfig": "workspace:*",
      "@types/bun": ShareDeps["@types/bun"],
      typescript: ShareDeps.typescript,
      rimraf: ShareDeps.rimraf,
      "@biomejs/biome": dependencies["@biomejs/biome"],
    } as Record<string, string>,
  };

  // 添加插件依赖
  if (plugins.includes("Bearer"))
    sample.dependencies["@elysiajs/bearer"] = dependencies["@elysiajs/bearer"];
  if (plugins.includes("CORS"))
    sample.dependencies["@elysiajs/cors"] = dependencies["@elysiajs/cors"];
  if (plugins.includes("HTML/JSX")) {
    sample.dependencies["@elysiajs/html"] = dependencies["@elysiajs/html"];
  }
  if (plugins.includes("JWT"))
    sample.dependencies["@elysiajs/jwt"] = dependencies["@elysiajs/jwt"];
  if (plugins.includes("Server Timing"))
    sample.dependencies["@elysiajs/server-timing"] =
      dependencies["@elysiajs/server-timing"];
  if (plugins.includes("Static"))
    sample.dependencies["@elysiajs/static"] = dependencies["@elysiajs/static"];
  if (plugins.includes("Swagger"))
    sample.dependencies["@elysiajs/swagger"] =
      dependencies["@elysiajs/swagger"];
  if (plugins.includes("Autoload"))
    sample.dependencies["elysia-autoload"] = dependencies["elysia-autoload"];

  if (plugins.includes("openAPI")) {
    sample.dependencies["@elysiajs/openapi"] =
      dependencies["@elysiajs/openapi"];
  }

  // ORM 支持
  if (orm === "Prisma") {
    sample.devDependencies.prisma = dependencies.prisma;
    sample.dependencies["@prisma/client"] = dependencies["@prisma/client"];
    sample.scripts["db:generate"] =
      `${pmExecuteMap[packageManager]} prisma generate`;
    sample.scripts["db:push"] =
      `${pmExecuteMap[packageManager]} prisma db push`;
    sample.scripts["db:migrate"] =
      `${pmExecuteMap[packageManager]} prisma migrate dev`;
    sample.scripts["db:studio"] =
      `${pmExecuteMap[packageManager]} prisma studio`;
  }

  if (orm === "Drizzle") {
    sample.dependencies["drizzle-orm"] = dependencies["drizzle-orm"];
    sample.devDependencies["drizzle-kit"] = dependencies["drizzle-kit"];
    if (driver === "node-postgres") {
      sample.dependencies.pg = dependencies.pg;
      sample.devDependencies["@types/pg"] = dependencies["@types/pg"];
    }
    if (driver === "Postgres.JS") {
      sample.dependencies.postgres = dependencies.postgres;
    }
    if (driver === "MySQL 2") {
      sample.dependencies.mysql2 = dependencies.mysql2;
    }
    sample.scripts["db:generate"] =
      `${pmExecuteMap[packageManager]} drizzle-kit generate`;
    sample.scripts["db:push"] =
      `${pmExecuteMap[packageManager]} drizzle-kit push`;
    sample.scripts["db:migrate"] =
      `${pmExecuteMap[packageManager]} drizzle-kit migrate`;
    sample.scripts["db:studio"] =
      `${pmExecuteMap[packageManager]} drizzle-kit studio`;
  }

  // Redis 支持
  if (redis) {
    sample.dependencies.ioredis = dependencies.ioredis;
    if (mockWithPGLite)
      sample.devDependencies["ioredis-mock"] = dependencies["ioredis-mock"];
  }

  // 其他工具
  if (others.includes("S3") && s3Client === "@aws-sdk/client-s3") {
    sample.dependencies["@aws-sdk/client-s3"] =
      dependencies["@aws-sdk/client-s3"];
    sample.dependencies["@aws-sdk/s3-request-presigner"] =
      dependencies["@aws-sdk/s3-request-presigner"];
  }

  if (telegramRelated) {
    sample.dependencies["@gramio/init-data"] =
      dependencies["@gramio/init-data"];
  }

  // Eden 用于前端类型支持
  sample.devDependencies["@elysiajs/eden"] = dependencies["@elysiajs/eden"];

  return JSON.stringify(sample, null, 2);
}
