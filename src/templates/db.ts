import { Preferences } from "../utils";

export function getDBIndex({ orm }: Preferences) {
	if (orm === "Prisma")
		return [
			`import { PrismaClient } from "@prisma/client"`,
			"",
			"export const prisma = new PrismaClient();",
			"",
			`export * from "@prisma/client"`,
		].join("\n");

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
}
