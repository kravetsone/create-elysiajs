#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { prompt } from "enquirer";
import minimist from "minimist";
import { getPackageJson } from "./templates";
import { Preferences, detectPackageManager } from "./utils";

const preferences = new Preferences();

const args = minimist(process.argv.slice(2));
const cwd = path.dirname(require.main!.path) + "/";

const packageManager = detectPackageManager();
const dir = args._.at(0);
if (!dir) throw Error("no dir");
console.log(cwd, detectPackageManager(), args);

fs.mkdir(cwd + dir).then(async () => {
	preferences.dir = dir;
	preferences.packageManager = packageManager;
	const { linter } = await prompt<{ linter: "ESLint" | "Biome" | "None" }>({
		type: "select",
		name: "linter",
		message: "Select linters/formatters:",
		choices: ["None", "ESLint", "Biome"],
	});
	preferences.linter = linter;

	const packageJson = getPackageJson(preferences);
	await fs.writeFile(
		cwd + dir + "/package.json",
		JSON.stringify(packageJson, null, 2),
	);
});
