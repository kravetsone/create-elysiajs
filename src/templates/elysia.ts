import { Preferences } from "../utils";

export function getElysiaIndex({ orm }: Preferences) {
	return [
		`import { Elysia } from "elysia"`,
		orm === "Prisma" ? `import { prisma } from "./db"` : "",
		"",
		"const app = new Elysia()",
		...(orm === "Prisma"
			? [
					"",
					"await prisma.$connect()",
					`console.log("🗄️ Database was connected!")`,
			  ]
			: ""),
		"",
		"app.listen(3000, () => console.log(`🦊 Server started at ${app.server?.url.origin}`))",
	].join("\n");
}
