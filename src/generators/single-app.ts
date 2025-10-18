import fs from "node:fs/promises";
import { prompt } from "enquirer";
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

export async function generateSingleApp(
	projectDir: string,
	preferences: PreferencesType,
) {
	// 生成文件结构
	await generateFiles(projectDir, preferences);
}

export async function collectPreferences(preferences: PreferencesType) {
	const { telegramRelated } = await prompt<{
		telegramRelated: PreferencesType["telegramRelated"];
	}>({
		type: "toggle",
		name: "telegramRelated",
		initial: "no",
		message:
			"Is your project related to Telegram (Did you wants to validate init data and etc)?",
	});
	preferences.telegramRelated = telegramRelated;

	const { linter } = await prompt<{ linter: PreferencesType["linter"] }>({
		type: "select",
		name: "linter",
		message: "Select linters/formatters:",
		choices: ["None", "ESLint", "Biome"],
	});
	preferences.linter = linter;

	const { orm } = await prompt<{ orm: PreferencesType["orm"] }>({
		type: "select",
		name: "orm",
		message: "Select ORM/Query Builder:",
		choices: ["None", "Prisma", "Drizzle"],
	});
	preferences.orm = orm;

	if (orm === "Prisma") {
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

	const { others } = await prompt<{ others: PreferencesType["others"] }>({
		type: "multiselect",
		name: "others",
		message: "Select others tools: (Space to select, Enter to continue)",
		choices: ["S3", "Posthog", "Jobify", "Husky"],
	});
	preferences.others = others;

	if (others.includes("S3")) {
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

	if (!others.includes("Husky")) {
		const { git } = await prompt<{ git: boolean }>({
			type: "toggle",
			name: "git",
			initial: "yes",
			message: "Create an empty Git repository?",
		});
		preferences.git = git;
	} else preferences.git = true;

	const { locks } = await prompt<{ locks: boolean }>({
		type: "toggle",
		name: "locks",
		initial: "yes",
		message: "Do you want to use Locks to prevent race conditions?",
	});
	preferences.locks = locks;

	if (others.includes("Jobify")) {
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

	const { docker } = await prompt<{ docker: boolean }>({
		type: "toggle",
		name: "docker",
		initial: "yes",
		message: "Create Dockerfile + docker.compose.yml?",
	});
	preferences.docker = docker;

	const { vscode } = await prompt<{ vscode: boolean }>({
		type: "toggle",
		name: "vscode",
		initial: "yes",
		message:
			"Create .vscode folder with VSCode extensions recommendations and settings?",
	});
	preferences.vscode = vscode;
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
	await fs.writeFile(`${projectDir}/.env`, getEnvFile(preferences));
	await fs.writeFile(
		`${projectDir}/.env.production`,
		getEnvFile(preferences, true),
	);
	await fs.writeFile(`${projectDir}/README.md`, getReadme(preferences));
	await fs.writeFile(
		`${projectDir}/.gitignore`,
		["dist", "node_modules", ".env", ".env.production"].join("\n"),
	);
	await fs.mkdir(`${projectDir}/src`);
	await fs.writeFile(
		`${projectDir}/src/server.ts`,
		getElysiaIndex(preferences),
	);
	await fs.writeFile(`${projectDir}/src/index.ts`, getIndex(preferences));
	await fs.writeFile(`${projectDir}/src/config.ts`, getConfigFile(preferences));

	await fs.mkdir(`${projectDir}/src/routes`);

	if (preferences.orm !== "None") {
		await fs.mkdir(`${projectDir}/src/db`);
		await fs.writeFile(
			`${projectDir}/src/db/index.ts`,
			getDBIndex(preferences),
		);

		if (preferences.orm === "Drizzle") {
			await fs.writeFile(
				`${projectDir}/drizzle.config.ts`,
				getDrizzleConfig(preferences),
			);
			await fs.writeFile(
				`${projectDir}/src/db/schema.ts`,
				preferences.database === "PostgreSQL"
					? `// import { pgTable } from "drizzle-orm/pg-core"`
					: preferences.database === "MySQL"
						? `// import { mysqlTable } from "drizzle-orm/mysql-core"`
						: `// import { sqliteTable } from "drizzle-orm/sqlite-core"`,
			);
			if (preferences.database === "SQLite")
				await fs.writeFile(`${projectDir}/sqlite.db`, "");
		}
	}

	await fs.mkdir(`${projectDir}/src/services`);

	if (preferences.others.includes("Posthog")) {
		await fs.writeFile(
			`${projectDir}/src/services/posthog.ts`,
			getPosthogIndex(),
		);
	}

	if (preferences.others.includes("Jobify")) {
		await fs.writeFile(`${projectDir}/src/services/jobify.ts`, getJobifyFile());
		await fs.mkdir(`${projectDir}/src/jobs`);
	}

	if (preferences.redis) {
		await fs.writeFile(`${projectDir}/src/services/redis.ts`, getRedisFile());
	}

	if (preferences.locks) {
		await fs.writeFile(
			`${projectDir}/src/services/locks.ts`,
			getLocksFile(preferences),
		);
	}

	if (preferences.s3Client !== "None") {
		await fs.writeFile(
			`${projectDir}/src/services/s3.ts`,
			getS3ServiceFile(preferences),
		);
	}

	if (preferences.telegramRelated) {
		await fs.writeFile(
			`${projectDir}/src/services/auth.plugin.ts`,
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
		await fs.writeFile(`${projectDir}/src/bot.ts`, getBotFile());
	}
}
