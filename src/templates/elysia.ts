import { Preferences } from "../utils";

const dbExportedMap = {
	Prisma: "prisma",
	Drizzle: "client",
};

export function getElysiaIndex({ orm }: Preferences) {
	return [
		`import { Elysia } from "elysia"`,
		orm !== "None" ? `import { ${dbExportedMap[orm]} } from "./db"\n` : "",
		"const app = new Elysia()",
		...(orm !== "None"
			? [
					"",
					orm === "Prisma"
						? "await prisma.$connect()"
						: "await client.connect()",
					`console.log("🗄️ Database was connected!")`,
					"",
			  ]
			: ""),
		"app.listen(3000, () => console.log(`🦊 Server started at ${app.server?.url.origin}`))",
	].join("\n");
}
