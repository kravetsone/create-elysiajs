import child_process from "node:child_process";
import { randomBytes } from "node:crypto";
import fs from "node:fs/promises";
import { promisify } from "node:util";
import { dependencies } from "./deps";

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

export const pluginDeps = {
	Bearer: "@elysiajs/bearer",
	CORS: "@elysiajs/cors",
	"HTML/JSX": "@elysiajs/html",
	JWT: "@elysiajs/jwt",
	"Server Timing": "@elysiajs/server-timing",
	Static: "@elysiajs/static",
	Swagger: "@elysiajs/swagger",
	Autoload: "elysia-autoload",
	openAPI: "@elysiajs/openapi",
} as const;

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
	others: ("S3" | "Husky" | "Posthog" | "Jobify")[] = [];
	plugins: (keyof typeof pluginDeps)[] = [];
	// integration with create-gramio
	isMonorepo = false;

	frontend: "None" | "Vue" | "React" | "Solid" | "Svelte" = "None";
	frontendDir = "";
	backendDir = "";

	docker = false;
	vscode = false;
	redis = false;
	locks = false;
	s3Client: "Bun.S3Client" | "@aws-sdk/client-s3" | "None" = "None";
	meta: {
		databasePassword: string;
	} = {
		databasePassword: randomBytes(12).toString("hex"),
	};

	noInstall = false;

	mockWithPGLite = false;

	telegramRelated = false;
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

export function getMonorepoRootDepsAndScripts({
	linter,
	orm,
	others,
	packageManager,
	mockWithPGLite,
}: Pick<
	Preferences,
	"linter" | "orm" | "others" | "packageManager" | "mockWithPGLite"
>) {
	const devDependencies: Record<string, string> = {};
	const scripts: Record<string, string> = {};

	// handle Linter
	if (linter === "Biome") {
		devDependencies["@biomejs/biome"] = dependencies["@biomejs/biome"];
		scripts.lint = `${pmExecuteMap[packageManager]} @biomejs/biome check .`;
		scripts["lint:fix"] = `${pmRunMap[packageManager]} lint --write`;
	}
	if (linter === "ESLint") {
		devDependencies.eslint = dependencies.eslint;
		devDependencies["@antfu/eslint-config"] =
			dependencies["@antfu/eslint-config"];
		scripts.lint = `${pmExecuteMap[packageManager]} eslint .`;
		scripts["lint:fix"] = `${pmExecuteMap[packageManager]} eslint --fix .`;
	}

	// handle ORM
	if (orm === "Drizzle") {
		devDependencies["drizzle-kit"] = dependencies["drizzle-kit"];
		scripts["db:generate"] =
			`${pmExecuteMap[packageManager]} drizzle-kit generate`;
		scripts["db:push"] = `${pmExecuteMap[packageManager]} drizzle-kit push`;
		scripts["db:studio"] = `${pmExecuteMap[packageManager]} drizzle-kit studio`;
	}
	if (orm === "Prisma") {
		devDependencies.prisma = dependencies.prisma;
		scripts["db:generate"] = `${pmExecuteMap[packageManager]} prisma generate`;
		scripts["db:push"] = `${pmExecuteMap[packageManager]} prisma db push`;
		scripts["db:studio"] = `${pmExecuteMap[packageManager]} prisma studio`;
	}

	// handle other tools
	if (others.includes("Husky")) {
		devDependencies.husky = dependencies.husky;
		scripts.prepare = "husky";
	}

	if (mockWithPGLite) {
		devDependencies["@electric-sql/pglite"] =
			dependencies["@electric-sql/pglite"];
	}

	return { devDependencies, scripts };
}
