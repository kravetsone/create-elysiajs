import child_process from "node:child_process";
import { randomBytes } from "node:crypto";
import fs from "node:fs/promises";
import { promisify } from "node:util";

export type PackageManager = "bun" | "npm" | "yarn" | "pnpm";

const nodeMajorVersion = process?.versions?.node?.split(".")[0];

if (nodeMajorVersion && Number(nodeMajorVersion) < 22)
	console.warn(
		`Node.js version ${process?.versions?.node} is not recommended for this template. Please upgrade to Node.js 22 or higher.`,
	);

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
	projectName = "";
	dir = "";
	packageManager: PackageManager = "bun";
	runtime: "Bun" | "Node.js" = "Bun";
	linter: "ESLint" | "Biome" | "None" = "None";
	orm: "Prisma" | "Drizzle" | "None" = "None";
	database:
		| "PostgreSQL"
		| "MySQL"
		| "MongoDB"
		| "SQLite"
		| "SQLServer"
		| "CockroachDB" = "PostgreSQL";
	driver:
		| "node-postgres"
		| "Bun.sql"
		| "Postgres.JS"
		| "MySQL 2"
		| "Bun SQLite"
		| "None" = "None";
	git = true;
	others: ("Husky" | "Posthog" | "Jobify")[] = [];
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

	docker = false;
	vscode = false;
	redis = false;
	locks = false;
	meta: {
		databasePassword: string;
	} = {
		databasePassword: randomBytes(12).toString("hex"),
	};
}

export type PreferencesType = InstanceType<typeof Preferences>;

export const exec = promisify(child_process.exec);

export const pmExecuteMap: Record<PackageManager, string> = {
	npm: "npx",
	bun: "bun x",
	yarn: "yarn dlx",
	pnpm: "pnpm dlx",
};

export const pmRunMap: Record<PackageManager, string> = {
	npm: "npm run",
	bun: "bun",
	yarn: "yarn",
	pnpm: "pnpm",
};

export const pmFilterMonorepoMap: Record<PackageManager, string | false> = {
	npm: false,
	yarn: false,
	bun: "bun --filter 'apps/*'",
	pnpm: "pnpm --filter 'apps/*'",
};

export const pmLockFilesMap: Record<PackageManager, string> = {
	npm: "package.lock.json",
	bun: "bun.lock",
	yarn: "yarn.lock",
	pnpm: "pnpm-lock.yaml",
};

export const pmInstallFrozenLockfile: Record<PackageManager, string> = {
	npm: "npm ci",
	bun: "bun install --frozen-lockfile",
	yarn: "yarn install --frozen-lockfile",
	pnpm: "pnpm install --frozen-lockfile",
};

export const pmInstallFrozenLockfileProduction: Record<PackageManager, string> =
	{
		npm: "npm ci --production",
		bun: "bun install --frozen-lockfile --production",
		yarn: "yarn install --frozen-lockfile --production",
		pnpm: "pnpm install --frozen-lockfile --prod",
	};
