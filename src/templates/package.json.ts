import { Preferences } from "../utils";

const dependencies = {
	elysia: "^0.8.9",
	typescript: "^5.3.3",
	"@types/bun": "^1.0.2",
	"@biomejs/biome": "^1.5.2",
	eslint: "^8.56.0",
	"eslint-config-standard-with-typescript": "^43.0.1",
	"eslint-plugin-promise": "^6.1.1",
	"eslint-plugin-import": "^2.29.1",
	"eslint-plugin-n": "^16.6.2",
	"@typescript-eslint/eslint-plugin": "^6.19.0",
	"eslint-plugin-drizzle": "^0.2.3",
	prisma: "^5.8.1",
	"drizzle-orm": "^0.29.3",
	"drizzle-kit": "^0.20.13",
	pg: "^8.11.3",
	"@types/pg": "^8.10.9",
	postgres: "^3.4.3",
	mysql2: "^3.7.1",
	husky: "^8.0.3",
	"@elysiajs/bearer": "^0.8.0",
	"@elysiajs/cors": "^0.8.0",
	"@elysiajs/html": "^0.8.0",
	"@kitajs/ts-html-plugin": "^1.3.3",
	"@elysiajs/jwt": "^0.8.0",
	"@elysiajs/server-timing": "^0.8.0",
	"@elysiajs/static": "^0.8.1",
	"@elysiajs/swagger": "^0.8.3",
	"elysia-autoload": "^0.1.2",
};

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
		scripts: {} as Record<string, string>,
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
		sample.scripts.prepare = "husky install";
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
