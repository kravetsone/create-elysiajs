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

	if (linter === "ESLint")
		await fs.writeFile(
			projectDir + "/.eslintrc",
			JSON.stringify({ extends: "standard" }, null, 2),
		);

	await fs.writeFile(projectDir + "/package.json", getPackageJson(preferences));
	await fs.writeFile(projectDir + "/tsconfig.json", getTSConfig(preferences));
	await fs.mkdir(projectDir + "/src");
	await fs.writeFile(projectDir + "/src/index.ts", getElysiaIndex(preferences));
	if (orm === "Prisma") {
		await fs.mkdir(projectDir + "/src/db");
		await fs.writeFile(
			projectDir + "/src/db/index.ts",
			getDBIndex(preferences),
		);
	}

	const commands = getInstallCommands(preferences);

	for await (const command of commands) {
		await task(command, async () => {
			await exec(command, {
				cwd: projectDir,
			});
		});
	}
});
