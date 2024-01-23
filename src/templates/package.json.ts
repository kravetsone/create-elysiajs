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
		scripts: {} as Record<string, string>,
		dependencies: {
			elysia: "^0.8.9",
		} as Record<string, string>,
		devDependencies: {
			typescript: "^5.3.3",
		} as Record<string, string>,
	};

	if (packageManager === "bun") sample.devDependencies["@types/bun"] = "^1.0.2";

	if (linter === "Biome") {
		sample.scripts.lint = "bunx @biomejs/biome check src";
		sample.scripts["lint:fix"] = "bun lint --apply";
		sample.devDependencies["@biomejs/biome"] = "^1.5.2";
	}
	if (linter === "ESLint") {
		sample.scripts.lint = `bunx eslint \"src/**/*.ts\"`;
		sample.scripts["lint:fix"] = `bunx eslint \"src/**/*.ts\" --fix`;
		sample.devDependencies.eslint = "^8.56.0";
		sample.devDependencies["eslint-config-standard-with-typescript"] =
			"^43.0.1";
		sample.devDependencies["eslint-plugin-promise"] = "^6.1.1";
		sample.devDependencies["eslint-plugin-import"] = "^2.29.1";
		sample.devDependencies["eslint-plugin-n"] = "^16.6.2";
		sample.devDependencies["@typescript-eslint/eslint-plugin"] = "^6.19.0";
		if (orm === "Drizzle")
			sample.devDependencies["eslint-plugin-drizzle"] = "^0.2.3";
	}

	if (orm === "Prisma") sample.devDependencies.prisma = "^5.8.1";
	if (orm === "Drizzle") {
		sample.dependencies["drizzle-orm"] = "^0.29.3";
		sample.devDependencies["drizzle-kit"] = "^0.20.13";
		if (driver === "node-postgres") {
			sample.dependencies.pg = "^8.11.3";
			sample.devDependencies["@types/pg"] = "^8.10.9";
			sample.scripts.generate = "bunx drizzle-kit generate:pg";
		}
		if (driver === "Postgres.JS") {
			sample.dependencies.postgres = "^3.4.3";
			sample.scripts["migration:generate"] = "bunx drizzle-kit generate:pg";
		}
		if (driver === "MySQL 2") {
			sample.dependencies.mysql2 = "^3.7.1";
			sample.scripts["migration:generate"] = "bunx drizzle-kit generate:mysql";
		}
		if (driver === "Bun SQLite")
			sample.scripts["migration:generate"] = "bunx drizzle-kit generate:sqlite";

		sample.scripts["migration:push"] = "bun src/db/migrate.ts";
		sample.scripts.migrate = "bun migration:generate && bun migration:push";
	}

	if (others.includes("Husky")) {
		sample.devDependencies.husky = "^8.0.3";
		sample.scripts.prepare = "husky install";
	}

	if (plugins.includes("Bearer"))
		sample.dependencies["@elysiajs/cors"] = "^0.8.0";
	if (plugins.includes("CORS"))
		sample.dependencies["@elysiajs/bearer"] = "^0.8.0";

	// @ts-expect-error sample.scripts is non-optional
	if (!Object.keys(sample.scripts).length) delete sample.scripts;

	return JSON.stringify(sample, null, 2);
}
