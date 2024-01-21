import { Preferences } from "../utils";

const dbExportedMap = {
	Prisma: "prisma",
	Drizzle: "client",
};

export function getElysiaIndex({ orm, driver }: Preferences) {
	return [
		`import { Elysia } from "elysia"`,
		orm !== "None" &&
		driver !== "Postgres.JS" &&
		driver !== "MySQL 2" &&
		driver !== "Bun SQLite"
			? `import { ${dbExportedMap[orm]} } from "./db"\n`
			: "",
		"const app = new Elysia()",
		...(orm !== "None" &&
		driver !== "Postgres.JS" &&
		driver !== "MySQL 2" &&
		driver !== "Bun SQLite"
			? [
					"",
					orm === "Prisma"
						? "await prisma.$connect()"
						: "await client.connect()",
					`console.log("🗄️ Database was connected!")`,
					"",
			  ]
			: "\n"),
		"app.listen(3000, () => console.log(`🦊 Server started at ${app.server?.url.origin}`))",
	].join("\n");
}
