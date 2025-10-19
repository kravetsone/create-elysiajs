#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import minimist from "minimist";
import task from "tasuku";
import {
	collectMonorepoPreferences,
	generateMonorepo,
} from "./generators/monorepo";
import { collectPreferences, generateSingleApp } from "./generators/single-app";
import { getInstallCommands } from "./templates";
import {
	createOrFindDir,
	detectPackageManager,
	exec,
	Preferences,
} from "./utils";

// Dynamic import wrapper for enquirer to avoid ESM/CommonJS issues
async function prompt<T = any>(questions: any): Promise<T> {
	const { default: Enquirer } = await import("enquirer");
	const enquirer = new Enquirer();
	return enquirer.prompt<T>(questions);
}

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
	const filesInTargetDirectory = await fs.readdir(projectDir);
	if (filesInTargetDirectory.length) {
		console.log(error);
		const { overwrite } = await prompt<{ overwrite: boolean }>({
			type: "toggle",
			name: "overwrite",
			initial: "yes",
			message: `You exit the process. Do you want to delete the directory ${path.basename(projectDir)}?`,
		});
		if (!overwrite) {
			console.log("Cancelled...");
			return process.exit(0);
		}
	}
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
		preferences.runtime = packageManager === "bun" ? "Bun" : "Node.js";

		// biome-ignore lint/complexity/noExtraBooleanCast: < explicit conversion for clarity>
		preferences.noInstall = !Boolean(args.install ?? true);

		// Ask whether to create a monorepo project
		const { isMonorepo } = await prompt<{ isMonorepo: boolean }>({
			type: "toggle",
			name: "isMonorepo",
			initial: "no",
			message: "Do you want to create a monorepo project?",
		});
		preferences.isMonorepo = isMonorepo;

		// 先收集所有用户偏好（在 task 之外执行）
		if (preferences.isMonorepo) {
			preferences.frontendDir = `${projectDir}/apps/frontend`;
			preferences.backendDir = `${projectDir}/apps/backend`;
			await collectMonorepoPreferences(preferences);
		} else {
			await collectPreferences(preferences);
		}

		// Then execute generation task (task only performs file generation, no interaction)
		await task("Generating template...", async ({ setTitle }) => {
			if (preferences.isMonorepo) {
				setTitle("Setting up monorepo structure...");
				await generateMonorepo(projectDir, preferences);
				setTitle("Monorepo template generation is complete!");
			} else {
				setTitle("Setting up single application...");
				await generateSingleApp(projectDir, preferences);
				setTitle("Single application template generation is complete!");
			}
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
