import { dependencies } from "../deps";
import { type Preferences, pmExecuteMap, pmRunMap } from "../utils";

export function getPackageJson({
	dir,
	projectName,
	linter,
	packageManager,
	orm,
	driver,
	others,
	plugins,
	isMonorepo,
	locks,
	redis,
}: Preferences) {
	const sample = {
		name: projectName,
		type: "module",
		scripts: {
			dev:
				packageManager === "bun"
					? "bun --watch src/index.ts"
					: `${pmExecuteMap[packageManager]} tsx watch --env-file .env src/index.ts`,
			start:
				packageManager === "bun"
					? "NODE_ENV=production bun run ./src/index.ts"
					: `NODE_ENV=production ${pmExecuteMap[packageManager]} tsx --env-file=.env --env-file=.env.production src/index.ts`,
		} as Record<string, string>,
		dependencies: {
			elysia: dependencies.elysia,
			"env-var": dependencies["env-var"],
		} as Record<keyof typeof dependencies, string>,
		devDependencies: {
			typescript: dependencies.typescript,
		} as Record<keyof typeof dependencies, string>,
	};

	// if (packageManager === "bun")
	sample.devDependencies["@types/bun"] = dependencies["@types/bun"];

	if (linter === "Biome") {
		sample.scripts.lint = `${pmExecuteMap[packageManager]} @biomejs/biome check src`;
		sample.scripts["lint:fix"] = `${pmRunMap[packageManager]} lint --write`;
		sample.devDependencies["@biomejs/biome"] = dependencies["@biomejs/biome"];
	}
	if (linter === "ESLint") {
		// \"src/**/*.ts\"
		sample.scripts.lint = `${pmExecuteMap[packageManager]} eslint`;
		// \"src/**/*.ts\"
		sample.scripts["lint:fix"] = `${pmExecuteMap[packageManager]} eslint --fix`;
		sample.devDependencies.eslint = dependencies.eslint;
		sample.devDependencies["@antfu/eslint-config"] =
			dependencies["@antfu/eslint-config"];
		if (orm === "Drizzle")
			sample.devDependencies["eslint-plugin-drizzle"] =
				dependencies["eslint-plugin-drizzle"];
	}

	if (orm === "Prisma") {
		sample.devDependencies.prisma = dependencies.prisma;
		sample.dependencies["@prisma/client"] = dependencies["@prisma/client"];
	}
	if (orm === "Drizzle") {
		sample.dependencies["drizzle-orm"] = dependencies["drizzle-orm"];
		sample.devDependencies["drizzle-kit"] = dependencies["drizzle-kit"];
		if (driver === "node-postgres") {
			sample.dependencies.pg = dependencies.pg;
			sample.devDependencies["@types/pg"] = dependencies["@types/pg"];
		}
		if (driver === "Postgres.JS") {
			sample.dependencies.postgres = dependencies.postgres;
		}
		if (driver === "MySQL 2") {
			sample.dependencies.mysql2 = dependencies.mysql2;
		}
		sample.scripts.generate = `${pmExecuteMap[packageManager]} drizzle-kit generate`;
		sample.scripts.push = `${pmExecuteMap[packageManager]} drizzle-kit push`;
		sample.scripts.migrate = `${pmExecuteMap[packageManager]} drizzle-kit migrate`;
		sample.scripts.studio = `${pmExecuteMap[packageManager]} drizzle-kit studio`;
	}

	if (others.includes("Husky")) {
		sample.devDependencies.husky = dependencies.husky;
		sample.scripts.prepare = "husky";
	}

	if (plugins.includes("Bearer"))
		sample.dependencies["@elysiajs/bearer"] = dependencies["@elysiajs/bearer"];
	if (plugins.includes("CORS"))
		sample.dependencies["@elysiajs/cors"] = dependencies["@elysiajs/cors"];
	if (plugins.includes("HTML/JSX")) {
		sample.dependencies["@elysiajs/html"] = dependencies["@elysiajs/html"];
		sample.dependencies["@kitajs/ts-html-plugin"] =
			dependencies["@kitajs/ts-html-plugin"];
	}
	if (plugins.includes("JWT"))
		sample.dependencies["@elysiajs/jwt"] = dependencies["@elysiajs/jwt"];
	if (plugins.includes("Server Timing"))
		sample.dependencies["@elysiajs/server-timing"] =
			dependencies["@elysiajs/server-timing"];
	if (plugins.includes("Static"))
		sample.dependencies["@elysiajs/static"] = dependencies["@elysiajs/static"];
	if (plugins.includes("Swagger"))
		sample.dependencies["@elysiajs/swagger"] =
			dependencies["@elysiajs/swagger"];
	if (plugins.includes("Autoload"))
		sample.dependencies["elysia-autoload"] = dependencies["elysia-autoload"];
	if (plugins.includes("Logger"))
		sample.dependencies["@bogeychan/elysia-logger"] =
			dependencies["@bogeychan/elysia-logger"];

	if (plugins.includes("Oauth 2.0")) {
		sample.dependencies.arctic = dependencies.arctic;
		sample.dependencies["elysia-oauth2"] = dependencies["elysia-oauth2"];
	}

	if (redis) sample.dependencies.ioredis = dependencies.ioredis;

	if (others.includes("Jobify")) {
		sample.dependencies.jobify = dependencies.jobify;
	}

	if (others.includes("Posthog")) {
		sample.dependencies["posthog-node"] = dependencies["posthog-node"];
	}

	if (locks) {
		sample.dependencies["@verrou/core"] = dependencies["@verrou/core"];
	}

	if (isMonorepo)
		sample.dependencies["@gramio/init-data"] =
			dependencies["@gramio/init-data"];

	if (others.includes("S3")) {
		sample.dependencies["@aws-sdk/client-s3"] = dependencies["@aws-sdk/client-s3"];
	}

	return JSON.stringify(sample, null, 2);
}
