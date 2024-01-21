import fs from "node:fs/promises";
import { PackageManager } from "./types";

export function detectPackageManager() {
	const userAgent = process.env.npm_config_user_agent;

	if (!userAgent)
		throw new Error(
			`Package manager was not detected. Please specify template with "--template bun"`,
		);

	return userAgent.split(" ")[0].split("/")[0] as PackageManager;
}

export async function createOrFindDir(path: string) {
	await fs.stat(path).catch(async () => fs.mkdir(path));
}

export class Preferences {
	dir = "";
	packageManager: PackageManager = "bun";
	linter: "ESLint" | "Biome" | "None" = "None";
	orm: "Prisma" | "Drizzle" | "None" = "None";
	database = "postgresql";
	driver: "node-postgres" | "Postgres.JS" | "None" = "None";
	git = true;
	others: "Husky"[] = [];
}
