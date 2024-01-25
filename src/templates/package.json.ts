import { dependencies } from "../deps";
import { Preferences } from "../utils";

export function getPackageJson({
	dir,
	linter,
	packageManager,
	orm,
	driver,
	others,
	plugins,
}: Preferences) {
	const sample = {
		name: dir,
		scripts: {
			dev: "bun src/index.ts --watch",
		} as Record<string, string>,
		dependencies: {
			elysia: dependencies.elysia,
		} as Record<string, string>,
		devDependencies: {
			typescript: dependencies.typescript,
		} as Record<string, string>,
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
		sample.devDependencies["eslint-config-standard-with-typescript"] =
			dependencies["eslint-config-standard-with-typescript"];
		sample.devDependencies["eslint-plugin-promise"] =
			dependencies["eslint-plugin-promise"];
		sample.devDependencies["eslint-plugin-import"] =
			dependencies["eslint-plugin-import"];
		sample.devDependencies["eslint-plugin-n"] = dependencies["eslint-plugin-n"];
		sample.devDependencies["@typescript-eslint/eslint-plugin"] =
			dependencies["@typescript-eslint/eslint-plugin"];
		if (orm === "Drizzle")
			sample.devDependencies["eslint-plugin-drizzle"] =
				dependencies["eslint-plugin-drizzle"];
	}

	if (orm === "Prisma") sample.devDependencies.prisma = dependencies.prisma;
	if (orm === "Drizzle") {
		sample.dependencies["drizzle-orm"] = dependencies["drizzle-orm"];
		sample.devDependencies["drizzle-kit"] = dependencies["drizzle-kit"];
		if (driver === "node-postgres") {
			sample.dependencies.pg = dependencies.pg;
			sample.devDependencies["@types/pg"] = dependencies["@types/pg"];
			sample.scripts.generate = "bunx drizzle-kit generate:pg";
		}
		if (driver === "Postgres.JS") {
			sample.dependencies.postgres = dependencies.postgres;
			sample.scripts["migration:generate"] = "bunx drizzle-kit generate:pg";
		}
		if (driver === "MySQL 2") {
			sample.dependencies.mysql2 = dependencies.mysql2;
			sample.scripts["migration:generate"] = "bunx drizzle-kit generate:mysql";
		}
		if (driver === "Bun SQLite")
			sample.scripts["migration:generate"] = "bunx drizzle-kit generate:sqlite";

		sample.scripts["migration:push"] = "bun src/db/migrate.ts";
		sample.scripts.migrate = "bun migration:generate && bun migration:push";
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

	if (!Object.keys(sample.scripts).length)
		// @ts-expect-error sample.scripts is non-optional
		delete sample.scripts;

	return JSON.stringify(sample, null, 2);
}
