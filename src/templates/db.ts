import { Preferences } from "../utils";

export function getDBMigrate() {
	return [
		`import { drizzle } from 'drizzle-orm/postgres-js'`,
		`import { migrate } from 'drizzle-orm/postgres-js/migrator'`,
		`import postgres from 'postgres'`,
		"",
		`const migrationClient = postgres("postgres://user:password@host:port/db", { max: 1 })`,
		"",
		`console.log("🗄️ Migration started...")`,
		`await migrate(drizzle(migrationClient), { migrationsFolder: "drizzle" })`,
		`console.log("🗄️ Migration ended...")`,
	].join("\n");
}

export function getDBIndex({ orm, driver }: Preferences) {
	if (orm === "Prisma")
		return [
			`import { PrismaClient } from "@prisma/client"`,
			"",
			"export const prisma = new PrismaClient();",
			"",
			`export * from "@prisma/client"`,
		].join("\n");

	if (driver === "node-postgres")
		return [
			`import { drizzle } from "drizzle-orm/node-postgres"`,
			`import { Client } from "pg"`,
			"",
			"export const client = new Client({",
			`  connectionString: "postgres://user:password@host:port/db",`,
			"})",
			"",
			"export const db = drizzle(client)",
		].join("\n");

	return [
		`import { drizzle } from "drizzle-orm/postgres-js"`,
		`import postgres from "postgres"`,
		"",
		`const client = postgres("postgres://user:password@host:port/db")`,
		"export const db = drizzle(client)",
	].join("\n");
}
