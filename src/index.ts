#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { prompt } from "enquirer";
import minimist from "minimist";
import task from "tasuku";
import {
	generateEslintConfig,
	getConfigFile,
	getDBIndex,
	getDrizzleConfig,
	getElysiaIndex,
	getElysiaMonorepo,
	getEnvFile,
	getIndex,
	getInstallCommands,
	getPackageJson,
	getReadme,
	getTSConfig,
} from "./templates";
import {
	getDevelopmentDockerCompose,
	getDockerCompose,
	getDockerfile,
} from "./templates/docker";
import { getJobifyFile } from "./templates/services/jobify";
import { getLocksFile } from "./templates/services/locks";
import { getPosthogIndex } from "./templates/services/posthog";
import { getRedisFile } from "./templates/services/redis";
import { getVSCodeExtensions, getVSCodeSettings } from "./templates/vscode";
import {
	Preferences,
	type PreferencesType,
	createOrFindDir,
	detectPackageManager,
	exec,
} from "./utils";

const preferences = new Preferences();

const args = minimist(process.argv.slice(2));

const packageManager = args.pm || detectPackageManager();
if (packageManager !== "bun") throw new Error("Now supported only bun");

const dir = args._.at(0);
if (!dir)
	throw new Error(
		"Specify the folder like this - bun create elysiajs dir-name",
	);
const projectDir = path.resolve(`${process.cwd()}/`, dir);

process.on("unhandledRejection", async (error) => {
	console.log("Template deleted...");
	console.error(error);
	await fs.rm(projectDir, { recursive: true });
	process.exit(0);
});

createOrFindDir(projectDir)
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.then(async () => {
		preferences.dir = dir;
		preferences.projectName = path.basename(projectDir);
		preferences.packageManager = packageManager;
		preferences.isMonorepo = !!args.monorepo;
		preferences.runtime = packageManager === "bun" ? "Bun" : "Node.js";

		if (!args.monorepo) {
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
				const driversMap: Record<typeof database, PreferencesType["driver"][]> =
					{
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
				"Logger",
				"HTML/JSX",
				"Static",
				"Bearer",
				"Server Timing",
			] as PreferencesType["plugins"],
		});
		preferences.plugins = plugins;
		if (!args.monorepo) {
			const { others } = await prompt<{ others: PreferencesType["others"] }>({
				type: "multiselect",
				name: "others",
				message: "Select others tools: (Space to select, Enter to continue)",
				choices: ["Posthog", "Jobify", "Husky"],
			});
			preferences.others = others;

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

		await task("Generating a template...", async ({ setTitle }) => {
			if (plugins.includes("Static")) await fs.mkdir(projectDir + "/public");

			if (preferences.linter === "ESLint")
				await fs.writeFile(
					`${projectDir}/eslint.config.mjs`,
					generateEslintConfig(preferences),
				);

			await fs.writeFile(
				projectDir + "/package.json",
				getPackageJson(preferences),
			);
			await fs.writeFile(
				projectDir + "/tsconfig.json",
				getTSConfig(preferences),
			);
			await fs.writeFile(projectDir + "/.env", getEnvFile(preferences));
			await fs.writeFile(
				projectDir + "/.env.production",
				getEnvFile(preferences, true),
			);
			await fs.writeFile(projectDir + "/README.md", getReadme(preferences));
			await fs.writeFile(
				projectDir + "/.gitignore",
				["dist", "node_modules", ".env"].join("\n"),
			);
			await fs.mkdir(projectDir + "/src");
			await fs.writeFile(
				projectDir + "/src/server.ts",
				getElysiaIndex(preferences),
			);
			await fs.writeFile(projectDir + "/src/index.ts", getIndex(preferences));
			await fs.writeFile(
				`${projectDir}/src/config.ts`,
				getConfigFile(preferences),
			);

			if (preferences.isMonorepo)
				await fs.writeFile(
					projectDir + "/src/services.ts",
					getElysiaMonorepo(),
				);

			// if (plugins.includes("Autoload"))
			await fs.mkdir(projectDir + "/src/routes");
			await fs.mkdir(projectDir + "/src/plugins");

			if (preferences.orm !== "None") {
				await fs.mkdir(projectDir + "/src/db");
				await fs.writeFile(
					projectDir + "/src/db/index.ts",
					getDBIndex(preferences),
				);

				if (preferences.orm === "Drizzle") {
					await fs.writeFile(
						projectDir + "/drizzle.config.ts",
						getDrizzleConfig(preferences),
					);
					await fs.writeFile(
						projectDir + "/src/db/schema.ts",
						preferences.database === "PostgreSQL"
							? `// import { pgTable } from "drizzle-orm/pg-core"`
							: preferences.database === "MySQL"
								? `// import { mysqlTable } from "drizzle-orm/mysql-core"`
								: `// import { sqliteTable } from "drizzle-orm/sqlite-core"`,
					);
					if (preferences.database === "SQLite")
						await fs.writeFile(projectDir + "/sqlite.db", "");
				}
			}

			await fs.mkdir(projectDir + "/src/services");

			if (preferences.others.includes("Posthog")) {
				await fs.writeFile(
					`${projectDir}/src/services/posthog.ts`,
					getPosthogIndex(),
				);
			}

			if (preferences.others.includes("Jobify")) {
				await fs.writeFile(
					`${projectDir}/src/services/jobify.ts`,
					getJobifyFile(),
				);
				await fs.mkdir(projectDir + "/src/jobs");
			}

			if (preferences.redis) {
				await fs.writeFile(
					`${projectDir}/src/services/redis.ts`,
					getRedisFile(),
				);
			}

			if (preferences.locks) {
				await fs.writeFile(
					`${projectDir}/src/services/locks.ts`,
					getLocksFile(preferences),
				);
			}

			if (preferences.docker) {
				await fs.writeFile(
					`${projectDir}/Dockerfile`,
					getDockerfile(preferences),
				);
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

			setTitle("Template generation is complete!");
		});

		const commands = getInstallCommands(preferences);

		for await (const command of commands) {
			await task(command, async () => {
				await exec(command, {
					cwd: projectDir,
				}).catch((e) => console.error(e));
			});
		}
	});
