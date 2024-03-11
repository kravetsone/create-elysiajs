import type { Preferences } from "../utils";

export function getDBMigrate({ driver }: Preferences) {
	if (driver === "Postgres.JS")
		return [
			`import { drizzle } from "drizzle-orm/postgres-js"`,
			`import { migrate } from "drizzle-orm/postgres-js/migrator"`,
			`import postgres from "postgres"`,
			"",
			"const migrationClient = postgres(process.env.DATABASE_URL as string, { max: 1 })",
			"",
			`console.log("🗄️ Migration started...")`,
			`await migrate(drizzle(migrationClient), { migrationsFolder: "drizzle" })`,
			`console.log("🗄️ Migration ended...")`,
		].join("\n");

	if (driver === "MySQL 2") {
		return [
			`import { migrate } from "drizzle-orm/mysql2/migrator"`,
			`import { connection, db } from "./index"`,
			"",
			`console.log("🗄️ Migration started...")`,
			`await migrate(db, { migrationsFolder: "drizzle" })`,
			"await connection.end()",
			`console.log("🗄️ Migration ended...")`,
		].join("\n");
	}

	if (driver === "node-postgres")
		return [
			`import { migrate } from "drizzle-orm/node-postgres/migrator"`,
			`import { client, db } from "./index"`,
			"",
			`console.log("🗄️ Migration started...")`,
			"await client.connect()",
			`await migrate(db, { migrationsFolder: "drizzle" })`,
			"await client.end()",
			`console.log("🗄️ Migration ended...")`,
		].join("\n");

	return [
		`import { migrate } from "drizzle-orm/bun-sqlite/migrator"`,
		`import { sqlite, db } from "./index"`,
		"",
		`console.log("🗄️ Migration started...")`,
		`migrate(db, { migrationsFolder: "drizzle" })`,
		"sqlite.close()",
		`console.log("🗄️ Migration ended...")`,
	].join("\n");
}

export function getDBIndex({ orm, driver }: Preferences) {
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
			"",
			"export const client = new Client({",
			"  connectionString: process.env.DATABASE_URL as string,",
			"})",
			"",
			"export const db = drizzle(client)",
		].join("\n");

	if (driver === "Postgres.JS")
		return [
			`import { drizzle } from "drizzle-orm/postgres-js"`,
			`import postgres from "postgres"`,
			"",
			"const client = postgres(process.env.DATABASE_URL as string)",
			"export const db = drizzle(client)",
		].join("\n");

	if (driver === "MySQL 2")
		return [
			`import { drizzle } from "drizzle-orm/mysql2"`,
			`import mysql from "mysql2/promise"`,
			"",
			"export const connection = await mysql.createConnection(process.env.DATABASE_URL as string)",
			`console.log("🗄️ Database was connected!")`,
			"",
			"export const db = drizzle(connection)",
		].join("\n");

	return [
		`import { drizzle } from "drizzle-orm/bun-sqlite"`,
		`import { Database } from "bun:sqlite";`,
		"",
		`export const sqlite = new Database("sqlite.db")`,
		"export const db = drizzle(sqlite)",
	].join("\n");
}

export function getDrizzleConfig({ database }: Preferences) {
	return [
		`import type { Config } from "drizzle-kit"`,
		"",
		"export default {",
		`  schema: "./src/db/schema.ts",`,
		`  out: "./drizzle",`,
		`  driver: "${
			database === "PostgreSQL"
				? "pg"
				: database === "MySQL"
				  ? "mysql2"
				  : "better-sqlite"
		}",`,
		"  dbCredentials: {",
		database === "PostgreSQL"
			? "    connectionString: process.env.DATABASE_URL as string"
			: database === "MySQL"
			  ? "    uri: process.env.DATABASE_URL as string"
			  : `    url: "./src/db/sqlite.db"`,
		"  }",
		"} satisfies Config",
	].join("\n");
}
