#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { prompt } from "enquirer";
import minimist from "minimist";
import task from "tasuku";
import {
	getDBIndex,
	getDrizzleConfig,
	getElysiaIndex,
	getEnvFile,
	getInstallCommands,
	getPackageJson,
	getReadme,
	getTSConfig,
} from "./templates";
import {
	Preferences,
	type PreferencesType,
	createOrFindDir,
	detectPackageManager,
	exec,
} from "./utils";

const preferences = new Preferences();

const args = minimist(process.argv.slice(2));

const packageManager = detectPackageManager();
if (packageManager !== "bun") throw new Error("Now supported only bun");

const dir = args._.at(0);
if (!dir)
	throw new Error(
		"Specify the folder like this - bun create elysiajs dir-name",
	);
const projectDir = path.resolve(process.cwd() + "/", dir);

createOrFindDir(projectDir).then(async () => {
	preferences.dir = dir;
	preferences.packageManager = packageManager;
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
			PostgreSQL: ["Postgres.JS", "node-postgres"],
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
			"Logger",
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
		choices: ["Husky"],
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

	await task("Generating a template...", async ({ setTitle }) => {
		if (plugins.includes("Static")) await fs.mkdir(projectDir + "/public");

		if (linter === "ESLint")
			await fs.writeFile(
				projectDir + "/.eslintrc",
				JSON.stringify(
					orm === "Drizzle"
						? {
								extends: [
									"standard-with-typescript",
									"plugin:drizzle/recommended",
								],
								plugins: ["drizzle"],
							}
						: { extends: ["standard-with-typescript"] },
					null,
					2,
				),
			);

		await fs.writeFile(
			projectDir + "/package.json",
			getPackageJson(preferences),
		);
		await fs.writeFile(projectDir + "/tsconfig.json", getTSConfig(preferences));
		await fs.writeFile(projectDir + "/.env", getEnvFile(preferences));
		await fs.writeFile(projectDir + "/README.md", getReadme(preferences));
		await fs.writeFile(
			projectDir + "/.gitignore",
			["dist", "node_modules", ".env"].join("\n"),
		);
		await fs.mkdir(projectDir + "/src");
		await fs.writeFile(
			projectDir + "/src/index.ts",
			getElysiaIndex(preferences),
		);
		if (plugins.includes("Autoload"))
			await fs.mkdir(projectDir + "/src/routes");

		if (orm !== "None") {
			await fs.mkdir(projectDir + "/src/db");
			await fs.writeFile(
				projectDir + "/src/db/index.ts",
				getDBIndex(preferences),
			);

			if (orm === "Drizzle") {
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
					await fs.writeFile(projectDir + "/src/db/sqlite.db", "");
			}
		}

		setTitle("Template generation is complete!");
	});

	const commands = getInstallCommands(preferences);

	for await (const command of commands) {
		await task(command, async () => {
			await exec(command, {
				cwd: projectDir,
			});
		});
	}
});
