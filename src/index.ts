#!/usr/bin/env node
import child_process from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { prompt } from "enquirer";
import minimist from "minimist";
import task from "tasuku";
import {
	getDBIndex,
	getDBMigrate,
	getElysiaIndex,
	getInstallCommands,
	getPackageJson,
	getTSConfig,
} from "./templates";
import { Preferences, createOrFindDir, detectPackageManager } from "./utils";
const exec = promisify(child_process.exec);

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
	const { linter } = await prompt<{ linter: (typeof preferences)["linter"] }>({
		type: "select",
		name: "linter",
		message: "Select linters/formatters:",
		choices: ["None", "ESLint", "Biome"],
	});
	preferences.linter = linter;

	const { orm } = await prompt<{ orm: (typeof preferences)["orm"] }>({
		type: "select",
		name: "orm",
		message: "Select ORM/Query Builder:",
		choices: ["None", "Prisma", "Drizzle"],
	});
	preferences.orm = orm;
	if (orm === "Prisma") {
		const { database } = await prompt<{ database: string }>({
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
		preferences.database = database.toLowerCase();
	}
	if (orm === "Drizzle") {
		const { database } = await prompt<{ database: string }>({
			type: "select",
			name: "database",
			message: "Select DataBase for Drizzle:",
			choices: ["PostgreSQL"],
		});
		const { driver } = await prompt<{ driver: (typeof preferences)["driver"] }>(
			{
				type: "select",
				name: "driver",
				message: `Select driver for ${database}:`,
				choices: ["Postgres.JS", "node-postgres"],
			},
		);
		preferences.database = database;
		preferences.driver = driver;
	}
	const { others } = await prompt<{ others: (typeof preferences)["others"] }>({
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
		if (linter === "ESLint")
			await fs.writeFile(
				projectDir + "/.eslintrc",
				JSON.stringify({ extends: "standard" }, null, 2),
			);

		await fs.writeFile(
			projectDir + "/package.json",
			getPackageJson(preferences),
		);
		await fs.writeFile(projectDir + "/tsconfig.json", getTSConfig());
		await fs.mkdir(projectDir + "/src");
		await fs.writeFile(
			projectDir + "/src/index.ts",
			getElysiaIndex(preferences),
		);

		if (orm !== "None") {
			await fs.mkdir(projectDir + "/src/db");
			await fs.writeFile(
				projectDir + "/src/db/index.ts",
				getDBIndex(preferences),
			);

			if (orm === "Drizzle") {
				await fs.writeFile(
					projectDir + "/drizzle.config.ts",
					[
						`import type { Config } from "drizzle-kit"`,
						"",
						"export default {",
						`  schema: "./src/db/schema.ts",`,
						`  out: "./drizzle",`,
						`  driver: "pg",`,
						"} satisfies Config",
					].join("\n"),
				);
				await fs.writeFile(
					projectDir + "/src/db/schema.ts",
					`// import { pgTable } from "drizzle-orm/pg-core"`,
				);
				if (preferences.driver === "Postgres.JS")
					await fs.writeFile(projectDir + "/src/db/migrate.ts", getDBMigrate());
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
