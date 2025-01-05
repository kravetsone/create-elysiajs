import dedent from "ts-dedent";
import type { PreferencesType } from "../utils";

export * from "./package.json";
export * from "./elysia";
export * from "./install";
export * from "./db";
export * from "./tsconfig.json";
export * from "./env";
export * from "./readme.md";
export * from "./eslint";

const dbExportedMap = {
	Prisma: "prisma",
	Drizzle: "client",
};

export function getIndex({ others, orm, driver }: PreferencesType) {
	const isShouldConnectToDB =
		orm !== "None" &&
		driver !== "Postgres.JS" &&
		driver !== "MySQL 2" &&
		driver !== "Bun SQLite";

	const gracefulShutdownTasks: string[] = [];
	const imports: string[] = [
		// `import { bot } from "./bot.ts"`,
		`import { config } from "./config.ts"`,
	];
	const startUpTasks: string[] = [];

	imports.push(`import { app } from "./server.ts"`);
	gracefulShutdownTasks.push("await app.stop()");

	// TODO: GramIO integration
	// gracefulShutdownTasks.push("await bot.stop()");

	if (others.includes("Posthog")) {
		imports.push(`import { posthog } from "./services/posthog.ts"`);
		gracefulShutdownTasks.push("await posthog.shutdown()");
	}

	if (isShouldConnectToDB) {
		imports.push(`import { ${dbExportedMap[orm]} } from "./db/index.ts"`);
		startUpTasks.push(dedent /* ts */`
            ${orm === "Prisma" ? "await prisma.$connect()" : "await client.connect()"}
            console.log("🗄️ Database was connected!")`);
	}

	startUpTasks.push(/*ts*/ `
    app.listen(config.PORT, () => console.log(\`🦊 Server started at \${app.server?.url.origin}\`))
    `);
	// 	startUpTasks.push(dedent /* tss */`
	//         if (config.NODE_ENV === "production")
	//             await bot.start({
	//                 webhook: {
	//                     url: \`\${config.API_URL}/\${config.BOT_TOKEN}\`,
	//                 },
	//             });
	//         else await bot.start();`);
	// }
	return dedent /* sts */`
    ${imports.join("\n")}
    const signals = ["SIGINT", "SIGTERM"];
    
    for (const signal of signals) {
        process.on(signal, async () => {
            console.log(\`Received \${signal}. Initiating graceful shutdown...\`);
            ${gracefulShutdownTasks.join("\n")}
            process.exit(0);
        })
    }
        
    process.on("uncaughtException", (error) => {
        console.error(error);
    })

    process.on("unhandledRejection", (error) => {
        console.error(error);
    })
        
${startUpTasks.join("\n")}`;
}
