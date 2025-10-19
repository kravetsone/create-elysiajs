import type { PreferencesType } from "../../utils";

/**
 * Get database schema import statement based on database type
 * Used for Drizzle ORM schema files
 */
export function getDatabaseSchemaImport(database: string): string {
	switch (database) {
		case "PostgreSQL":
			return `// import { pgTable } from "drizzle-orm/pg-core"`;
		case "MySQL":
			return `// import { mysqlTable } from "drizzle-orm/mysql-core"`;
		case "SQLite":
			return `// import { sqliteTable } from "drizzle-orm/sqlite-core"`;
		default:
			return `// import { pgTable } from "drizzle-orm/pg-core"`;
	}
}

/**
 * Get drivers map for Drizzle ORM based on database type and runtime
 */
export function getDrizzleDriversMap(
	database: string,
	runtime: "Bun" | "Node.js",
) {
	const driversMap: Record<string, PreferencesType["driver"][]> = {
		PostgreSQL: (
			[
				runtime === "Bun" ? "Bun.sql" : undefined,
				"node-postgres",
				"Postgres.JS",
			] as const
		).filter((x) => x !== undefined),
		MySQL: ["MySQL 2"],
		SQLite: ["Bun SQLite"],
	};

	return driversMap[database] || [];
}

/**
 * Generate database-related files for both monorepo and single-app
 */
export async function generateDatabaseFiles(
	projectDir: string,
	preferences: PreferencesType,
	isMonorepo: boolean = false,
) {
	const fs = await import("node:fs/promises");

	// Directory structure differs between monorepo and single-app
	const dbDir = isMonorepo
		? `${projectDir}/apps/backend/src/libs`
		: `${projectDir}/src/db`;
	const configDir = isMonorepo ? `${projectDir}/apps/backend` : projectDir;

	if (preferences.orm === "Drizzle") {
		// Import here to avoid circular dependencies
		const { getDrizzleConfig } = await import("../../templates");

		await fs.writeFile(
			`${configDir}/drizzle.config.ts`,
			getDrizzleConfig(preferences),
		);
		await fs.writeFile(
			`${dbDir}/schema.ts`,
			getDatabaseSchemaImport(preferences.database || "PostgreSQL"),
		);
		if (preferences.database === "SQLite") {
			const dbPath = isMonorepo
				? `${projectDir}/apps/backend/sqlite.db`
				: `${projectDir}/sqlite.db`;
			await fs.writeFile(dbPath, "");
		}
	}
}

/**
 * Generate backend directory structure common to both monorepo and single-app
 */
export async function generateBackendDirectories(
	projectDir: string,
	isMonorepo: boolean = false,
) {
	const fs = await import("node:fs/promises");

	const baseDir = isMonorepo ? `${projectDir}/apps/backend` : projectDir;
	const srcDir = `${baseDir}/src`;

	// Common directories
	const directories = [
		`${srcDir}/configs`,
		`${srcDir}/modules/user`,
		`${srcDir}/plugins/err`,
		`${srcDir}/utils`,
		`${srcDir}/types`,
	];

	if (isMonorepo) {
		// Additional directories for monorepo
		directories.push(`${srcDir}/libs`);
	} else {
		// Single-app specific directories
		directories.push(`${srcDir}/routes`, `${srcDir}/services`);
	}

	// Create all directories
	for (const dir of directories) {
		await fs.mkdir(dir, { recursive: true });
	}

	// Create public directory if Static plugin is used
	// Note: This needs to be called after preferences are available
	return { baseDir, srcDir };
}

/**
 * Generate common backend files (config, index, server)
 */
export async function generateCommonBackendFiles(
	projectDir: string,
	preferences: PreferencesType,
	isMonorepo: boolean = false,
) {
	const fs = await import("node:fs/promises");
	const { getConfigFile, getIndex, getEnvFile } = await import(
		"../../templates"
	);
	const { getElysiaIndex } = await import("../../templates/elysia");

	const baseDir = isMonorepo ? `${projectDir}/apps/backend` : projectDir;
	const srcDir = `${baseDir}/src`;

	// Common files
	await fs.writeFile(`${srcDir}/index.ts`, getIndex(preferences));
	await fs.writeFile(`${srcDir}/server.ts`, getElysiaIndex(preferences));
	await fs.writeFile(`${srcDir}/config.ts`, getConfigFile(preferences));

	// Environment files
	await fs.writeFile(`${baseDir}/.env`, getEnvFile(preferences));
	await fs.writeFile(
		`${baseDir}/.env.production`,
		getEnvFile(preferences, true),
	);

	return { baseDir, srcDir };
}
