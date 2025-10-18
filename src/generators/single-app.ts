import fs from "node:fs/promises";
import dedent from "ts-dedent";
import {
  generateEslintConfig,
  getConfigFile,
  getDBIndex,
  getDrizzleConfig,
  getEnvFile,
  getIndex,
  getReadme,
  getTSConfig,
} from "../templates";
import { getBotFile } from "../templates/bot";
import {
  getDevelopmentDockerCompose,
  getDockerCompose,
  getDockerfile,
} from "../templates/docker";
import { getElysiaIndex } from "../templates/elysia";
import { getPackageJson } from "../templates/package/package.json";
import { getAuthPlugin } from "../templates/services/auth";
import { getJobifyFile } from "../templates/services/jobify";
import { getLocksFile } from "../templates/services/locks";
import { getPosthogIndex } from "../templates/services/posthog";
import { getRedisFile } from "../templates/services/redis";
import { getS3ServiceFile } from "../templates/services/s3";
import {
  getPreloadFile,
  getTestSharedFile,
  getTestsAPIFile,
  getTestsIndex,
} from "../templates/tests";
import { getVSCodeExtensions, getVSCodeSettings } from "../templates/vscode";
import type { PreferencesType } from "../utils";
import {
  getDatabaseSchemaImport,
  generateDatabaseFiles,
  generateBackendDirectories,
  generateCommonBackendFiles,
} from "./utils/backend-helpers";
import {
  collectTelegramPreferences,
  collectCommonBackendPreferences,
  collectOtherToolsPreferences,
} from "./utils/preference-collectors";

export async function generateSingleApp(
  projectDir: string,
  preferences: PreferencesType,
) {
  try {
    // 生成文件结构
    await generateFiles(projectDir, preferences);
  } catch (error) {
    throw new Error(`Failed to generate single app: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function collectPreferences(preferences: PreferencesType) {
  // Collect Telegram preference with single-app default
  await collectTelegramPreferences(preferences, {
    initial: "no",
    message: "Is your project related to Telegram (Did you want to validate init data and etc)?",
  });

  // Collect common backend preferences with single-app options
  await collectCommonBackendPreferences(preferences, {
    linterChoices: ["None", "ESLint", "Biome"], // Single app supports all linters
    ormChoices: ["None", "Prisma", "Drizzle"], // Single app supports all ORMs
    includePrismaDatabases: true, // Single app includes Prisma options
  });

  // Collect other tools preferences
  await collectOtherToolsPreferences(preferences, {
    includeS3: true,
    includePosthog: true,
    includeJobify: true,
    includeHusky: true,
    includeLocks: true,
    includeRedis: true,
    includeDocker: true,
    includeVSCode: true,
  });
}

async function generateFiles(projectDir: string, preferences: PreferencesType) {
  if (preferences.plugins.includes("Static"))
    await fs.mkdir(`${projectDir}/public`);

  if (preferences.linter === "ESLint")
    await fs.writeFile(
      `${projectDir}/eslint.config.mjs`,
      generateEslintConfig(preferences),
    );

  await fs.writeFile(`${projectDir}/package.json`, getPackageJson(preferences));
  await fs.writeFile(`${projectDir}/tsconfig.json`, getTSConfig(preferences));
  await fs.writeFile(`${projectDir}/README.md`, getReadme(preferences));
  await fs.writeFile(
    `${projectDir}/.gitignore`,
    ["dist", "node_modules", ".env", ".env.production"].join("\n"),
  );

  // 使用共享工具生成通用后端文件和目录
  await generateCommonBackendFiles(projectDir, preferences, false); // not isMonorepo
  const { srcDir } = await generateBackendDirectories(projectDir, false); // not isMonorepo

  // 生成数据库相关文件
  if (preferences.orm !== "None") {
    await fs.writeFile(
      `${srcDir}/db/index.ts`,
      getDBIndex(preferences),
    );
    // 使用共享工具生成数据库文件
    await generateDatabaseFiles(projectDir, preferences, false); // not isMonorepo
  }

  await fs.mkdir(`${srcDir}/services`);

  if (preferences.others.includes("Posthog")) {
    await fs.writeFile(
      `${srcDir}/services/posthog.ts`,
      getPosthogIndex(),
    );
  }

  if (preferences.others.includes("Jobify")) {
    await fs.writeFile(`${srcDir}/services/jobify.ts`, getJobifyFile());
    await fs.mkdir(`${srcDir}/jobs`);
  }

  if (preferences.redis) {
    await fs.writeFile(`${srcDir}/services/redis.ts`, getRedisFile());
  }

  if (preferences.locks) {
    await fs.writeFile(
      `${srcDir}/services/locks.ts`,
      getLocksFile(preferences),
    );
  }

  if (preferences.s3Client !== "None") {
    await fs.writeFile(
      `${srcDir}/services/s3.ts`,
      getS3ServiceFile(preferences),
    );
  }

  if (preferences.telegramRelated) {
    await fs.writeFile(
      `${srcDir}/services/auth.plugin.ts`,
      getAuthPlugin(),
    );
  }

  if (preferences.docker) {
    await fs.writeFile(`${projectDir}/Dockerfile`, getDockerfile(preferences));
    await fs.writeFile(
      `${projectDir}/docker-compose.dev.yml`,
      getDevelopmentDockerCompose(preferences),
    );
    await fs.writeFile(
      `${projectDir}/docker-compose.yml`,
      getDockerCompose(preferences),
    );
  }

  if (preferences.vscode) {
    await fs.mkdir(`${projectDir}/.vscode`);
    await fs.writeFile(
      `${projectDir}/.vscode/settings.json`,
      getVSCodeSettings(preferences),
    );
    await fs.writeFile(
      `${projectDir}/.vscode/extensions.json`,
      getVSCodeExtensions(preferences),
    );
  }

  if (preferences.mockWithPGLite) {
    await fs.mkdir(`${projectDir}/tests`);
    await fs.writeFile(
      `${projectDir}/tests/preload.ts`,
      getPreloadFile(preferences),
    );
    await fs.writeFile(`${projectDir}/tests/api.ts`, getTestsAPIFile());
    await fs.mkdir(`${projectDir}/tests/e2e`);
    await fs.writeFile(
      `${projectDir}/tests/e2e/index.test.ts`,
      getTestsIndex(),
    );

    await fs.writeFile(
      `${projectDir}/bunfig.toml`,
      dedent /* toml */`[test]
      preload = ["./tests/preload.ts"]
    `,
    );

    if (preferences.telegramRelated)
      await fs.writeFile(`${projectDir}/tests/shared.ts`, getTestSharedFile());
  }

  if (preferences.telegramRelated) {
    await fs.writeFile(`${srcDir}/bot.ts`, getBotFile());
  }
}
