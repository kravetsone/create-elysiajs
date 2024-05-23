import type { Preferences } from "../utils";

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
		`  database: "${database.toLowerCase()}",`,
		"  dbCredentials: {",
		"    url: process.env.DATABASE_URL as string",
		"  }",
		"} satisfies Config",
	].join("\n");
}
