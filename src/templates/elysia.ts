import { Preferences } from "../utils";

const dbExportedMap = {
	Prisma: "prisma",
	Drizzle: "client",
};

export function getElysiaIndex({ orm, driver, plugins }: Preferences) {
	const elysiaPlugins: string[] = [];
	const elysiaImports: string[] = [`import { Elysia } from "elysia"`];

	if (plugins.includes("Bearer")) {
		elysiaImports.push(`import { bearer } from "@elysiajs/bearer"`);
		elysiaPlugins.push(".use(bearer())");
	}
	if (plugins.includes("CORS")) {
		elysiaImports.push(`import { cors } from "@elysiajs/cors"`);
		elysiaPlugins.push(".use(cors())");
	}
	if (plugins.includes("HTML/JSX")) {
		elysiaImports.push(`import { html } from "@elysiajs/html"`);
		elysiaPlugins.push(".use(html())");
	}
	if (plugins.includes("JWT")) {
		elysiaImports.push(`import { jwt } from "@elysiajs/jwt"`);
		elysiaPlugins.push(
			".use(jwt({ secret: process.env.JWT_SECRET as string }))",
		);
	}
	if (plugins.includes("Server Timing")) {
		elysiaImports.push(
			`import { serverTiming } from "@elysiajs/server-timing"`,
		);
		elysiaPlugins.push(".use(serverTiming())");
	}
	if (plugins.includes("Static")) {
		elysiaImports.push(`import { staticPlugin  } from "@elysiajs/static"`);
		elysiaPlugins.push(".use(staticPlugin())");
	}

	if (
		orm !== "None" &&
		driver !== "Postgres.JS" &&
		driver !== "MySQL 2" &&
		driver !== "Bun SQLite"
	)
		elysiaImports.push(`import { ${dbExportedMap[orm]} } from "./db"`);

	return [
		...elysiaImports,
		"",
		"const app = new Elysia()",
		...elysiaPlugins,
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
		"app.listen(process.env.PORT as string, () => console.log(`🦊 Server started at ${app.server?.url.origin}`))",
	].join("\n");
}
