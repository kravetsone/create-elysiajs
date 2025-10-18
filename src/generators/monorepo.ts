import fs from "node:fs/promises";
import { prompt } from "enquirer";
import {
  getConfigFile,
  getDBIndex,
  getDrizzleConfig,
  getEnvFile,
  getIndex,
  getReadme,
  getTSConfigBase,
  getTurboJson,
} from "../templates";
import { getCommonSchemas } from "../templates/backend/libs/common-schemas";
import { getConnection } from "../templates/backend/libs/connection";
import { getHealthyCheck } from "../templates/backend/libs/healthyCheck";
import { getSchemaHelper } from "../templates/backend/libs/schemaHelper";
import { getUserModuleIndex } from "../templates/backend/modules/user";
import { getUsersController } from "../templates/backend/modules/user/users.controller";
import { getUsersModel } from "../templates/backend/modules/user/users.model";
import { getUsersService } from "../templates/backend/modules/user/users.service";
import { getErrorIndex } from "../templates/backend/plugins/err";
import { getErrorBase } from "../templates/backend/plugins/err/base";
import { getDatabaseErrorMapper } from "../templates/backend/plugins/err/database-error-mapper";
import { getErrorPlugin } from "../templates/backend/plugins/err/err.plugin";
import { getErrorGuards } from "../templates/backend/plugins/err/guards";
import { getHttpErrors } from "../templates/backend/plugins/err/http-error";
import { getLoggerPlugin } from "../templates/backend/plugins/logger";
import { getRes } from "../templates/backend/utils/Res";
import { getBackendTypes } from "../templates/backend-types";
import { getBotFile } from "../templates/bot";
import { getElysiaIndex } from "../templates/elysia";
import { getBackendPackageJson } from "../templates/package/backend-package.json";
import { getPackageJson } from "../templates/package/package.json";
import { getAuthPlugin } from "../templates/services/auth";
import {
  getBackendTSConfig,
  getElysiaTSConfig,
  getFrontendTSConfig,
  getNodeTSConfig,
  getTypeScriptConfigPackageJson,
} from "../templates/tsconfig";
import { getAppTSConfig } from "../templates/tsconfig/app";
import {
  getAppVue,
  getEnvDTs,
  getFrontendPackageJson,
  getHomeVue,
  getIndexHTML,
  getViteConfig,
  getVueMain,
} from "../templates/vue";
import { getEdenClient } from "../templates/vue/eden-client";
import { getHandleApi } from "../templates/vue/handleApi";
import { getMainCSS } from "../templates/vue/main.css";
import { getRouter } from "../templates/vue/router";
import { getUseApiWithToast } from "../templates/vue/useApiWithToast";
import { getUseTreaty } from "../templates/vue/useTreaty";
import type { PreferencesType } from "../utils";

export async function generateMonorepo(
  projectDir: string,
  preferences: PreferencesType,
) {
  try {
    // 生成 monorepo 结构
    await generateMonorepoStructure(projectDir, preferences);

    // 生成后端应用（重用单应用逻辑）
    await generateBackendApp(projectDir, preferences);

    // 生成前端应用（如果需要）
    if (preferences.frontend !== "None") {
      await generateFrontendApp(projectDir, preferences);
    }
  } catch (error) {
    // Clean up partial state or re-throw with context
    throw new Error(`Failed to generate monorepo: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function collectMonorepoPreferences(preferences: PreferencesType) {
  // 询问是否启用 telegram 相关功能
  const { telegramRelated } = await prompt<{
    telegramRelated: boolean;
  }>({
    type: "toggle",
    name: "telegramRelated",
    initial: "yes",
    message: "Do you want to include Telegram bot support?",
  });
  preferences.telegramRelated = telegramRelated;

  // 在 monorepo 模式下询问前端框架
  const { frontend } = await prompt<{
    frontend: PreferencesType["frontend"];
  }>({
    type: "select",
    name: "frontend",
    message: "Select frontend framework: (currently only Vue supported)",
    choices: ["None", "Vue"],
  });
  preferences.frontend = frontend === "None" ? "None" : "Vue"; // 目前只支持 Vue

  // 收集其他偏好（简化版本，专注于核心功能）
  const { linter } = await prompt<{ linter: PreferencesType["linter"] }>({
    type: "select",
    name: "linter",
    message: "Select linters/formatters:",
    choices: ["None", "Biome"],
  });
  preferences.linter = linter;

  const { orm } = await prompt<{ orm: PreferencesType["orm"] }>({
    type: "select",
    name: "orm",
    message: "Select ORM/Query Builder:",
    choices: ["None", "Drizzle"],
  });
  preferences.orm = orm;

  if (orm === "Drizzle") {
    const { database } = await prompt<{
      database: "PostgreSQL";
    }>({
      type: "select",
      name: "database",
      message: "Select DataBase for Drizzle:",
      choices: ["PostgreSQL"],
    });

    const driversMap: Record<typeof database, PreferencesType["driver"][]> = {
      PostgreSQL: (
        [
          preferences.runtime === "Bun" ? "Bun.sql" : undefined,
          "node-postgres",
          "Postgres.JS",
        ] as const
      ).filter((x) => x !== undefined),
    };

    const { driver } = await prompt<{ driver: PreferencesType["driver"] }>({
      type: "select",
      name: "driver",
      message: `Select driver for ${database}:`,
      choices: driversMap[database],
    });
    preferences.database = database;
    preferences.driver = driver;

    if (database === "PostgreSQL") {
      const { mockWithPGLite } = await prompt<{
        mockWithPGLite: PreferencesType["mockWithPGLite"];
      }>({
        type: "toggle",
        name: "mockWithPGLite",
        initial: "yes",
        message:
          "Do you want to mock database in tests with PGLite (Postgres in WASM)?",
      });
      preferences.mockWithPGLite = mockWithPGLite;
    }
  }

  const { plugins } = await prompt<{
    plugins: PreferencesType["plugins"];
  }>({
    type: "multiselect",
    name: "plugins",
    message: "Select Elysia plugins: (Space to select, Enter to continue)",
    choices: [
      "CORS",
      "Swagger",
      "openAPI",
      "JWT",
      "Autoload",
      "Oauth 2.0",
      "HTML/JSX",
      "Static",
      "Bearer",
      "Server Timing",
    ] as PreferencesType["plugins"],
  });
  preferences.plugins = plugins;
}

async function generateMonorepoStructure(
  projectDir: string,
  preferences: PreferencesType,
) {
  // 根目录文件
  await fs.writeFile(`${projectDir}/package.json`, getPackageJson(preferences));
  await fs.writeFile(`${projectDir}/turbo.json`, getTurboJson());
  await fs.writeFile(
    `${projectDir}/.gitignore`,
    ["dist", "node_modules", ".env", ".env.production", ".turbo"].join("\n"),
  );
  await fs.writeFile(`${projectDir}/README.md`, getReadme(preferences));
  // 创建 packages 目录
  await fs.mkdir(`${projectDir}/packages`);

  // 创建 tsconfig 包
  await fs.mkdir(`${projectDir}/packages/tsconfig`);
  await fs.writeFile(
    `${projectDir}/packages/tsconfig/package.json`,
    getTypeScriptConfigPackageJson(preferences.projectName),
  );
  await fs.writeFile(
    `${projectDir}/packages/tsconfig/base.json`,
    getTSConfigBase(),
  );
  await fs.writeFile(
    `${projectDir}/packages/tsconfig/elysia.json`,
    getElysiaTSConfig(),
  );
  await fs.writeFile(
    `${projectDir}/packages/tsconfig/vue.json`,
    getFrontendTSConfig("Vue"),
  );
  await fs.writeFile(
    `${projectDir}/packages/tsconfig/node.json`,
    getNodeTSConfig(),
  );

  // 创建 apps 目录
  await fs.mkdir(`${projectDir}/apps`);
}

async function generateBackendApp(
  projectDir: string,
  preferences: PreferencesType,
) {
  const backendDir = `${projectDir}/apps/backend`;

  // 创建后端应用目录和文件
  await fs.mkdir(backendDir);
  await fs.writeFile(
    `${backendDir}/package.json`,
    getBackendPackageJson(preferences),
  );
  await fs.writeFile(
    `${backendDir}/tsconfig.json`,
    getBackendTSConfig(preferences.plugins),
  );
  await fs.writeFile(`${backendDir}/.env`, getEnvFile(preferences));
  await fs.writeFile(
    `${backendDir}/.env.production`,
    getEnvFile(preferences, true),
  );
  await fs.mkdir(`${backendDir}/src`);
  await fs.writeFile(`${backendDir}/src/index.ts`, getIndex(preferences));
  await fs.writeFile(
    `${backendDir}/src/server.ts`,
    getElysiaIndex(preferences),
  );

  // 创建 configs 目录
  await fs.mkdir(`${backendDir}/src/configs`);

  await fs.writeFile(
    `${backendDir}/src/configs/config.ts`,
    getConfigFile(preferences),
  );
  // 创建模块文件
  await fs.mkdir(`${backendDir}/src/modules`);

  // 创建用户模块示例
  await fs.mkdir(`${backendDir}/src/modules/user`);
  await fs.writeFile(
    `${backendDir}/src/modules/user/index.ts`,
    getUserModuleIndex(),
  );
  await fs.writeFile(
    `${backendDir}/src/modules/user/users.model.ts`,
    getUsersModel(),
  );
  await fs.writeFile(
    `${backendDir}/src/modules/user/users.service.ts`,
    getUsersService(),
  );
  await fs.writeFile(
    `${backendDir}/src/modules/user/users.controller.ts`,
    getUsersController(),
  );

  // 生成数据库相关文件
  if (preferences.orm !== "None") {
    await fs.mkdir(`${backendDir}/src/libs`);
    await fs.writeFile(
      `${backendDir}/src/libs/index.ts`,
      getDBIndex(preferences),
    );

    // 生成 libs 辅助文件
    await fs.writeFile(
      `${backendDir}/src/libs/schemaHelper.ts`,
      getSchemaHelper(),
    );
    await fs.writeFile(
      `${backendDir}/src/libs/common-schemas.ts`,
      getCommonSchemas(),
    );
    await fs.writeFile(`${backendDir}/src/libs/connection.ts`, getConnection());
    await fs.writeFile(
      `${backendDir}/src/libs/healthyCheck.ts`,
      getHealthyCheck(),
    );

    if (preferences.orm === "Drizzle") {
      await fs.writeFile(
        `${backendDir}/drizzle.config.ts`,
        getDrizzleConfig(preferences),
      );
      await fs.writeFile(
        `${backendDir}/src/libs/schema.ts`,
        preferences.database === "PostgreSQL"
          ? `// import { pgTable } from "drizzle-orm/pg-core"`
          : preferences.database === "MySQL"
            ? `// import { mysqlTable } from "drizzle-orm/mysql-core"`
            : `// import { sqliteTable } from "drizzle-orm/sqlite-core"`,
      );
      if (preferences.database === "SQLite")
        await fs.writeFile(`${backendDir}/sqlite.db`, "");
    }
  }

  // 创建 plugins 目录（完整生成）
  await fs.mkdir(`${backendDir}/src/plugins`);

  // 创建 logger 插件
  await fs.writeFile(`${backendDir}/src/plugins/logger.ts`, getLoggerPlugin());

  // 创建错误处理插件目录和文件
  await fs.mkdir(`${backendDir}/src/plugins/err`);
  await fs.writeFile(`${backendDir}/src/plugins/err/base.ts`, getErrorBase());
  await fs.writeFile(
    `${backendDir}/src/plugins/err/http-error.ts`,
    getHttpErrors(),
  );
  await fs.writeFile(
    `${backendDir}/src/plugins/err/guards.ts`,
    getErrorGuards(),
  );
  await fs.writeFile(
    `${backendDir}/src/plugins/err/database-error-mapper.ts`,
    getDatabaseErrorMapper(),
  );
  await fs.writeFile(`${backendDir}/src/plugins/err/index.ts`, getErrorIndex());
  await fs.writeFile(
    `${backendDir}/src/plugins/err/err.plugin.ts`,
    getErrorPlugin(),
  );

  if (preferences.telegramRelated) {
    await fs.writeFile(
      `${backendDir}/src/plugins/auth.plugin.ts`,
      getAuthPlugin(),
    );
  }

  // 创建 utils 目录
  await fs.mkdir(`${backendDir}/src/utils`);
  await fs.writeFile(`${backendDir}/src/utils/Res.ts`, getRes());

  // 生成类型定义文件
  await fs.mkdir(`${backendDir}/src/types`);
  await fs.writeFile(
    `${backendDir}/src/types/index.ts`,
    getBackendTypes(preferences),
  );

  // 生成 bot 文件
  if (preferences.telegramRelated) {
    await fs.writeFile(`${backendDir}/src/bot.ts`, getBotFile());
  }
}

async function generateFrontendApp(
  projectDir: string,
  preferences: PreferencesType,
) {
  const frontendDir = `${projectDir}/apps/frontend`;

  await fs.mkdir(frontendDir);

  // 创建前端 .env 文件
  await fs.writeFile(
    `${frontendDir}/.env`,
    `VITE_API_URL=http://localhost:5000`,
  );
  await fs.writeFile(
    `${frontendDir}/.env.production`,
    getEnvFile(preferences, true),
  );

  await fs.writeFile(
    `${frontendDir}/package.json`,
    getFrontendPackageJson(preferences),
  );

  if (preferences.frontend === "Vue") {
    // 先创建必要的目录结构
    await fs.mkdir(`${frontendDir}/src`);
    await fs.mkdir(`${frontendDir}/src/pages`);
    await fs.mkdir(`${frontendDir}/src/components`);
    await fs.mkdir(`${frontendDir}/src/assets`);
    await fs.mkdir(`${frontendDir}/src/assets/styles`);
    await fs.mkdir(`${frontendDir}/src/utils`);
    await fs.mkdir(`${frontendDir}/src/utils/api`);
    await fs.mkdir(`${frontendDir}/src/router`);
    await fs.mkdir(`${frontendDir}/public`);

    // 配置文件
    await fs.writeFile(
      `${frontendDir}/tsconfig.json`,
      getFrontendTSConfig(preferences.frontend),
    );
    await fs.writeFile(`${frontendDir}/tsconfig.node.json`, getNodeTSConfig());

    await fs.writeFile(`${frontendDir}/tsconfig.app.json`, getAppTSConfig());
    await fs.writeFile(
      `${frontendDir}/vite.config.ts`,
      getViteConfig(preferences.frontend),
    );
    await fs.writeFile(
      `${frontendDir}/index.html`,
      getIndexHTML(preferences.projectName),
    );

    // 主要文件
    await fs.writeFile(`${frontendDir}/src/main.ts`, getVueMain());
    await fs.writeFile(
      `${frontendDir}/src/App.vue`,
      getAppVue(preferences.projectName),
    );
    await fs.writeFile(`${frontendDir}/src/pages/Home.vue`, getHomeVue());
    await fs.writeFile(`${frontendDir}/src/env.d.ts`, getEnvDTs());

    // 样式文件
    await fs.writeFile(
      `${frontendDir}/src/assets/styles/main.css`,
      getMainCSS(),
    );

    // 路由文件
    await fs.writeFile(`${frontendDir}/src/router/index.ts`, getRouter());

    // API 工具文件
    await fs.writeFile(
      `${frontendDir}/src/utils/api/useTreaty.ts`,
      getUseTreaty(),
    );
    await fs.writeFile(
      `${frontendDir}/src/utils/api/useApiWithToast.ts`,
      getUseApiWithToast(),
    );
    await fs.writeFile(
      `${frontendDir}/src/utils/api/handleApi.ts`,
      getHandleApi(),
    );
  }
}
