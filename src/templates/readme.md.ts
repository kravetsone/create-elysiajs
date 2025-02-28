import type { Preferences, PreferencesType } from "../utils";

const links: Record<
	| Exclude<
			| "ElysiaJS"
			| PreferencesType["linter"]
			| PreferencesType["orm"]
			| PreferencesType["plugins"][0]
			| PreferencesType["others"][0]
			| PreferencesType["database"],
			"None"
	  >
	| "Jobify"
	| "Docker",
	string
> = {
	ElysiaJS: "[ElysiaJS](https://elysiajs.com/)",
	ESLint: "[ESLint](https://eslint.org/)",
	Biome: "[Biome](https://biomejs.dev/)",
	Prisma: "[Prisma](https://www.prisma.io/)",
	Drizzle: "[Drizzle](https://orm.drizzle.team/)",
	CORS: "[CORS](https://elysiajs.com/plugins/cors.html)",
	Swagger: "[Swagger](https://elysiajs.com/plugins/swagger.html)",
	JWT: "[JWT](https://elysiajs.com/plugins/jwt.html)",
	Autoload: "[Autoload](https://github.com/kravetsone/elysia-autoload)",
	"Oauth 2.0": "[Oauth 2.0](https://github.com/kravetsone/elysia-oauth2)",
	Logger: "[Logger](https://github.com/bogeychan/elysia-logger)",
	"HTML/JSX": "[HTML/JSX](https://elysiajs.com/plugins/html.html)",
	Static: "[Static](https://elysiajs.com/plugins/static.html)",
	Bearer: "[Bearer](https://elysiajs.com/plugins/bearer.html)",
	"Server Timing":
		"[Server Timing](https://elysiajs.com/plugins/server-timing.html)",
	Husky: "[Husky](https://typicode.github.io/husky/)",
	PostgreSQL: "[PostgreSQL](https://www.postgresql.org/)",
	MySQL: "[MySQL](https://www.mysql.com/)",
	MongoDB: "[MongoDB](https://www.mongodb.com/)",
	SQLite: "[SQLite](https://sqlite.org/)",
	SQLServer: "[SQLServer](https://www.microsoft.com/sql-server)",
	CockroachDB: "[CockroachDB](https://www.cockroachlabs.com/)",
	Jobify: "[Jobify](https://github.com/kravetsone/jobify)",
	Docker: "[Docker](https://www.docker.com/)",
	Posthog: "[Posthog](https://posthog.com/docs/libraries/node)",
};

export function getReadme({
	dir,
	linter,
	orm,
	database,
	plugins,
	others,
	docker,
}: Preferences) {
	const stack = [];

	stack.push(`- Web framework - ${links.ElysiaJS}`);
	if (linter !== "None") stack.push(`- Linter - ${links[linter]}`);
	if (orm !== "None") stack.push(`- ORM - ${links[orm]} (${links[database]})`);
	if (plugins.length)
		stack.push(`- Elysia plugins - ${plugins.map((x) => links[x]).join(", ")}`);
	if (others.length)
		stack.push(
			`- Others tools - ${[
				docker ? links.Docker : undefined,
				...others.map((x) => links[x]),
			]
				.filter(Boolean)
				.join(", ")}`,
		);

	const instruction = [];

	instruction.push("## Development\n");

	if (docker) {
		instruction.push(
			"Start development services (DB, Redis etc):\n",
			"```bash",
			"docker compose -f docker-compose.dev.yml up",
			"```\n",
		);
	}

	instruction.push("Start the project:\n", "```bash", "bun dev", "```\n");

	if (orm === "Drizzle") {
		instruction.push(
			"## Migrations\n",
			"Push schema to Database:\n",
			"```bash",
			"bunx drizzle-kit push",
			"```",
			"Generate new migration:\n",
			"```bash",
			"bunx drizzle-kit generate",
			"```",
			"Apply migrations:\n",
			"```bash",
			"bunx drizzle-kit migrate",
			"```\n",
		);
	}

	if (orm === "Prisma") {
		instruction.push(
			"## Migrations\n",
			"Generate new migration:\n",
			"```bash",
			"bunx prisma migrate dev",
			"```",
			"Apply migrations:\n",
			"```bash",
			"bunx prisma migrate deploy",
			"```\n",
		);
	}

	instruction.push("## Production\n");

	if (docker) {
		instruction.push(
			"Run project in `production` mode:\n",
			"```bash",
			"docker compose up -d",
			"```",
		);
	} else
		instruction.push(
			"Run project in `production` mode:\n",
			"```bash",
			"bun start",
			"```",
		);

	return [
		`# ${dir}`,
		"",
		"This template autogenerated by [create-elysiajs](https://github.com/kravetsone/create-elysiajs)",
		"",
		"### Stack",
		...stack,
		"",
		// "### Instructions",
		...instruction,
	].join("\n");
}
