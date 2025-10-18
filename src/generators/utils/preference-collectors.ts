import { prompt } from "enquirer";
import type { PreferencesType } from "../../utils";

/**
 * Collect common backend preferences (linter, ORM, database, driver, plugins)
 * This function extracts shared logic between monorepo and single-app generators
 */
export async function collectCommonBackendPreferences(
  preferences: PreferencesType,
  options: {
    linterChoices?: ("None" | "ESLint" | "Biome")[];
    ormChoices?: ("None" | "Prisma" | "Drizzle")[];
    includePrismaDatabases?: boolean;
  } = {}
) {
  const {
    linterChoices = ["None", "ESLint", "Biome"],
    ormChoices = ["None", "Prisma", "Drizzle"],
    includePrismaDatabases = true,
  } = options;

  // Collect linter preference
  const { linter } = await prompt<{ linter: PreferencesType["linter"] }>({
    type: "select",
    name: "linter",
    message: "Select linters/formatters:",
    choices: linterChoices,
  });
  preferences.linter = linter;

  // Collect ORM preference
  const { orm } = await prompt<{ orm: PreferencesType["orm"] }>({
    type: "select",
    name: "orm",
    message: "Select ORM/Query Builder:",
    choices: ormChoices,
  });
  preferences.orm = orm;

  // Collect database and driver preferences based on ORM
  if (orm === "Prisma" && includePrismaDatabases) {
    const { database } = await prompt<{
      database: PreferencesType["database"];
    }>({
      type: "select",
      name: "database",
      message: "Select DataBase for Prisma:",
      choices: [
        "PostgreSQL",
        "MySQL",
        "MongoDB",
        "SQLite",
        "SQLServer",
        "CockroachDB",
      ],
    });
    preferences.database = database;
  }

  if (orm === "Drizzle") {
    const { database } = await prompt<{
      database: "PostgreSQL" | "MySQL" | "SQLite";
    }>({
      type: "select",
      name: "database",
      message: "Select DataBase for Drizzle:",
      choices: ["PostgreSQL", "MySQL", "SQLite"],
    });

    const driversMap: Record<typeof database, PreferencesType["driver"][]> = {
      PostgreSQL: (
        [
          preferences.runtime === "Bun" ? "Bun.sql" : undefined,
          "node-postgres",
          "Postgres.JS",
        ] as const
      ).filter((x) => x !== undefined),
      MySQL: ["MySQL 2"],
      SQLite: ["Bun SQLite"],
    };

    const { driver } = await prompt<{ driver: PreferencesType["driver"] }>({
      type: "select",
      name: "driver",
      message: `Select driver for ${database}:`,
      choices: driversMap[database],
    });
    preferences.database = database;
    preferences.driver = driver;

    // Ask about PGLite for PostgreSQL
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

  // Collect Elysia plugins preference
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

/**
 * Collect other tools preferences (S3, Posthog, Jobify, Husky, etc.)
 */
export async function collectOtherToolsPreferences(
  preferences: PreferencesType,
  options: {
    includeS3?: boolean;
    includePosthog?: boolean;
    includeJobify?: boolean;
    includeHusky?: boolean;
    includeLocks?: boolean;
    includeRedis?: boolean;
    includeDocker?: boolean;
    includeVSCode?: boolean;
  } = {}
) {
  const {
    includeS3 = true,
    includePosthog = true,
    includeJobify = true,
    includeHusky = true,
    includeLocks = true,
    includeRedis = true,
    includeDocker = true,
    includeVSCode = true,
  } = options;

  // Build choices for other tools
  const otherChoices: string[] = [];
  if (includeS3) otherChoices.push("S3");
  if (includePosthog) otherChoices.push("Posthog");
  if (includeJobify) otherChoices.push("Jobify");
  if (includeHusky) otherChoices.push("Husky");

  if (otherChoices.length > 0) {
    const { others } = await prompt<{ others: PreferencesType["others"] }>({
      type: "multiselect",
      name: "others",
      message: "Select others tools: (Space to select, Enter to continue)",
      choices: otherChoices,
    });
    preferences.others = others;

    // S3 client preference
    if (includeS3 && others.includes("S3")) {
      const { s3Client } = await prompt<{
        s3Client: PreferencesType["s3Client"];
      }>({
        type: "select",
        name: "s3Client",
        message: "Select S3 client:",
        choices: ["Bun.S3Client", "@aws-sdk/client-s3"],
      });
      preferences.s3Client = s3Client;
    }

    // Git repository preference (if not using Husky)
    if (includeHusky) {
      if (!others.includes("Husky")) {
        const { git } = await prompt<{ git: boolean }>({
          type: "toggle",
          name: "git",
          initial: "yes",
          message: "Create an empty Git repository?",
        });
        preferences.git = git;
      } else {
        preferences.git = true;
      }
    }
  }

  // Locks preference
  if (includeLocks) {
    const { locks } = await prompt<{ locks: boolean }>({
      type: "toggle",
      name: "locks",
      initial: "yes",
      message: "Do you want to use Locks to prevent race conditions?",
    });
    preferences.locks = locks;
  }

  // Redis preference
  if (includeRedis) {
    if (preferences.others.includes("Jobify")) {
      preferences.redis = true;
    } else {
      const { redis } = await prompt<{ redis: boolean }>({
        type: "toggle",
        name: "redis",
        initial: "yes",
        message: "Do you want to use Redis?",
      });
      preferences.redis = redis;
    }
  }

  // Docker preference
  if (includeDocker) {
    const { docker } = await prompt<{ docker: boolean }>({
      type: "toggle",
      name: "docker",
      initial: "yes",
      message: "Create Dockerfile + docker.compose.yml?",
    });
    preferences.docker = docker;
  }

  // VS Code preference
  if (includeVSCode) {
    const { vscode } = await prompt<{ vscode: boolean }>({
      type: "toggle",
      name: "vscode",
      initial: "yes",
      message:
        "Create .vscode folder with VSCode extensions recommendations and settings?",
    });
    preferences.vscode = vscode;
  }
}

/**
 * Collect Telegram-related preferences
 */
export async function collectTelegramPreferences(
  preferences: PreferencesType,
  options: {
    initial?: "yes" | "no";
    message?: string;
  } = {}
) {
  const { initial = "no", message } = options;

  const { telegramRelated } = await prompt<{
    telegramRelated: boolean;
  }>({
    type: "toggle",
    name: "telegramRelated",
    initial,
    message: message || "Is your project related to Telegram (Did you want to validate init data and etc)?",
  });
  preferences.telegramRelated = telegramRelated;
}

/**
 * Collect frontend framework preference (for monorepo)
 */
export async function collectFrontendPreferences(
  preferences: PreferencesType,
  options: {
    choices?: ("None" | "Vue" | "React" | "Solid" | "Svelte")[];
    message?: string;
  } = {}
) {
  const { choices = ["None", "Vue"], message } = options;

  const { frontend } = await prompt<{
    frontend: PreferencesType["frontend"];
  }>({
    type: "select",
    name: "frontend",
    message: message || "Select frontend framework:",
    choices,
  });
  preferences.frontend = frontend;
}