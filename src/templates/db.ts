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

	return [].join("\n");
}
