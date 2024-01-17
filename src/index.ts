#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { prompt } from "enquirer";
import minimist from "minimist";
import { getInstallCommands, getPackageJson, getElysiaIndex } from "./templates";
import { Preferences, detectPackageManager } from "./utils";
import child_process from "node:child_process";
import { promisify } from "node:util";
const exec = promisify(child_process.exec);

const preferences = new Preferences();

const args = minimist(process.argv.slice(2));
const cwd = path.dirname(require.main!.path) + "/";

const packageManager = detectPackageManager();
const dir = args._.at(0);
if (!dir) throw Error("no dir");
const projectDir = cwd + dir;


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

	await fs.writeFile(projectDir + "/package.json", getPackageJson(preferences));
	await fs.mkdir(projectDir + "/src");
	await fs.writeFile(projectDir + "/src/index.ts", getElysiaIndex(preferences));

	const commands = getInstallCommands(preferences);

	for await (const command of commands) {
        console.log(command)
		await exec(command, {
            cwd: projectDir
        });
	}
});
