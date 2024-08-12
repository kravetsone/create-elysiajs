import child_process from "node:child_process";
import fs from "node:fs/promises";
import { promisify } from "node:util";

export type PackageManager = "bun" | "npm" | "yarn" | "pnpm";

export function detectPackageManager() {
	const userAgent = process.env.npm_config_user_agent;

	if (!userAgent)
		throw new Error(
			`Package manager was not detected. Please specify template with "--pm bun"`,
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
	database:
		| "PostgreSQL"
		| "MySQL"
		| "MongoDB"
		| "SQLite"
		| "SQLServer"
		| "CockroachDB" = "PostgreSQL";
	driver: "node-postgres" | "Postgres.JS" | "MySQL 2" | "Bun SQLite" | "None" =
		"None";
	git = true;
	others: "Husky"[] = [];
	plugins: (
		| "JWT"
		| "CORS"
		| "Swagger"
		| "Autoload"
		| "Oauth 2.0"
		| "Logger"
		| "HTML/JSX"
		| "Static"
		| "Bearer"
		| "Server Timing"
	)[] = [];
	// integration with create-gramio
	isMonorepo = false;
}

export type PreferencesType = InstanceType<typeof Preferences>;

export const exec = promisify(child_process.exec);
