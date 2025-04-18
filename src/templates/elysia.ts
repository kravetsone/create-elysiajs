import type { Preferences } from "../utils";

export function getElysiaIndex({
	orm,
	driver,
	plugins,
	telegramRelated,
	isMonorepo,
}: Preferences) {
	const elysiaPlugins: string[] = [];
	const elysiaImports: string[] = [
		`import { Elysia } from "elysia"`,
		`import { config } from "./config.ts"`,
	];

	if (plugins.includes("Logger")) {
		elysiaImports.push(`import { logger } from "@bogeychan/elysia-logger"`);
		elysiaPlugins.push(".use(logger())");
	}

	if (plugins.includes("Swagger")) {
		elysiaImports.push(`import { swagger } from "@elysiajs/swagger"`);
		elysiaPlugins.push(".use(swagger())");
	}
	if (plugins.includes("Oauth 2.0")) {
		elysiaImports.push(`import { oauth2 } from "elysia-oauth2"`);
		elysiaPlugins.push(".use(oauth2({}))");
	}
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
		elysiaPlugins.push(".use(jwt({ secret: config.JWT_SECRET }))");
	}
	if (plugins.includes("Server Timing")) {
		elysiaImports.push(
			`import { serverTiming } from "@elysiajs/server-timing"`,
		);
		elysiaPlugins.push(".use(serverTiming())");
	}
	if (plugins.includes("Static")) {
		elysiaImports.push(`import { staticPlugin } from "@elysiajs/static"`);
		elysiaPlugins.push(".use(staticPlugin())");
	}
	if (plugins.includes("Autoload")) {
		elysiaImports.push(`import { autoload } from "elysia-autoload"`);
		elysiaPlugins.push(".use(autoload())");
	}

	elysiaPlugins.push(`.get("/", "Hello World")`);

	if (telegramRelated && !isMonorepo) {
		elysiaImports.push(`import { bot } from "./bot.ts"`);
		elysiaImports.push(`import { webhookHandler } from "./services/auth.ts"`);
		elysiaPlugins.push(
			`.post(\`/\${config.BOT_TOKEN}\`, webhookHandler(bot, "elysia"), {
				detail: {
					hide: true,
				},
			})`,
		);
	}

	return [
		...elysiaImports,
		"",
		"export const app = new Elysia()",
		...elysiaPlugins,
		plugins.includes("Autoload") ? "\nexport type ElysiaApp = typeof app" : "",
	].join("\n");
}
