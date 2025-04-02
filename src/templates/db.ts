import type { Preferences } from "../utils.js";

export const driverNamesToDrizzle: Record<Preferences["driver"], string> = {
	"node-postgres": "node-postgres",
	"Bun.sql": "bun-sql",
	"Postgres.JS": "postgres-js",
	"MySQL 2": "mysql2",
	"Bun SQLite": "bun-sqlite",
	None: "",
};

export const driverNames: Record<Preferences["driver"], string> = {
	"node-postgres": "pg",
	"Bun.sql": "??",
	"Postgres.JS": "postgres",
	"MySQL 2": "mysql2",
	"Bun SQLite": "bun:sqlite",
	None: "",
};
export function getDBIndex({ orm, driver, packageManager }: Preferences) {
	if (orm === "Prisma")
		return [
			`import { PrismaClient } from "@prisma/client"`,
			"",
			"export const prisma = new PrismaClient()",
			"",
			`export * from "@prisma/client"`,
		].join("\n");

	if (driver === "node-postgres")
		return [
			`import { drizzle } from "drizzle-orm/node-postgres"`,
			`import { Client } from "pg"`,
			`import { config } from "../config.ts"`,
			"",
			"export const client = new Client({",
			"  connectionString: config.DATABASE_URL,",
			"})",
			"",
			"export const db = drizzle({",
			"  client,",
			'  casing: "snake_case",',
			"})",
		].join("\n");

	if (driver === "Postgres.JS")
		return [
			`import { drizzle } from "drizzle-orm/postgres-js"`,
			`import postgres from "postgres"`,
			`import { config } from "../config.ts"`,
			"",
			"const client = postgres(config.DATABASE_URL)",
			"export const db = drizzle({",
			"  client,",
			'  casing: "snake_case",',
			"})",
		].join("\n");

	if (driver === "Bun.sql")
		return [
			`import { drizzle } from "drizzle-orm/bun-sql"`,
			`import { config } from "../config.ts"`,
			`import { SQL } from "bun"`,
			"",
			"export const sql = new SQL(config.DATABASE_URL)",
			"",
			"export const db = drizzle({",
			"  client: sql,",
			'  casing: "snake_case",',
			"})",
		].join("\n");

	if (driver === "MySQL 2")
		return [
			`import { drizzle } from "drizzle-orm/mysql2"`,
			`import mysql from "mysql2/promise"`,
			`import { config } from "../config.ts"`,
			"",
			"export const connection = await mysql.createConnection(config.DATABASE_URL)",
			`console.log("🗄️ Database was connected!")`,
			"",
			"export const db = drizzle({",
			"  client: connection,",
			'  casing: "snake_case",',
			"})",
		].join("\n");

	if (driver === "Bun SQLite" && packageManager === "bun")
		return [
			`import { drizzle } from "drizzle-orm/bun-sqlite"`,
			`import { Database } from "bun:sqlite";`,
			"",
			`export const sqlite = new Database("sqlite.db")`,
			"export const db = drizzle({",
			"  client: sqlite,",
			'  casing: "snake_case",',
			"})",
		].join("\n");

	return [
		`import { drizzle } from "drizzle-orm/better-sqlite3`,
		`import { Database } from "better-sqlite3";`,
		"",
		`export const sqlite = new Database("sqlite.db")`,
		"export const db = drizzle({",
		"  client: sqlite,",
		'  casing: "snake_case",',
		"})",
	].join("\n");
}

export function getDrizzleConfig({ database }: Preferences) {
	return [
		`import type { Config } from "drizzle-kit"`,
		`import env from "env-var"`,
		"",
		'const DATABASE_URL = env.get("DATABASE_URL").required().asString()',
		"",
		"export default {",
		`  schema: "./src/db/schema.ts",`,
		`  out: "./drizzle",`,
		`  dialect: "${database.toLowerCase()}",`,
		`  casing: "snake_case",`,
		"  dbCredentials: {",
		"    url: DATABASE_URL",
		"  }",
		"} satisfies Config",
	].join("\n");
}
