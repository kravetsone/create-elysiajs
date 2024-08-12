import { dependencies } from "../deps";
import type { Preferences } from "../utils";

export function getPackageJson({
	dir,
	linter,
	packageManager,
	orm,
	driver,
	others,
	plugins,
	isMonorepo,
}: Preferences) {
	const sample = {
		name: dir,
		scripts: {
			dev: "bun  --watch src/index.ts",
		} as Record<string, string>,
		dependencies: {
			elysia: dependencies.elysia,
		} as Record<keyof typeof dependencies, string>,
		devDependencies: {
			typescript: dependencies.typescript,
		} as Record<keyof typeof dependencies, string>,
	};

	if (packageManager === "bun")
		sample.devDependencies["@types/bun"] = dependencies["@types/bun"];

	if (linter === "Biome") {
		sample.scripts.lint = "bunx @biomejs/biome check src";
		sample.scripts["lint:fix"] = "bun lint --apply";
		sample.devDependencies["@biomejs/biome"] = dependencies["@biomejs/biome"];
	}
	if (linter === "ESLint") {
		sample.scripts.lint = `bunx eslint \"src/**/*.ts\"`;
		sample.scripts["lint:fix"] = `bunx eslint \"src/**/*.ts\" --fix`;
		sample.devDependencies.eslint = dependencies.eslint;
		sample.devDependencies["@antfu/eslint-config"] =
			dependencies["@antfu/eslint-config"];
		if (orm === "Drizzle")
			sample.devDependencies["eslint-plugin-drizzle"] =
				dependencies["eslint-plugin-drizzle"];
	}

	if (orm === "Prisma") sample.devDependencies.prisma = dependencies.prisma;
	if (orm === "Drizzle") {
		sample.dependencies["drizzle-orm"] = dependencies["drizzle-orm"];
		sample.devDependencies["drizzle-kit"] = dependencies["drizzle-kit"];

		sample.scripts.generate = "bunx drizzle-kit generate";
		sample.scripts["migration:push"] = "bunx drizzle-kit push";
		sample.scripts.migrate = "bun migration:generate && bun migration:push";

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
		sample.dependencies.artic = dependencies.artic;
		sample.dependencies["elysia-oauth2"] = dependencies["elysia-oauth2"];
	}

	if (isMonorepo)
		sample.dependencies["@gramio/init-data"] =
			dependencies["@gramio/init-data"];

	return JSON.stringify(sample, null, 2);
}
