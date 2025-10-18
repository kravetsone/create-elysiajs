import dedent from "ts-dedent";
import type { PreferencesType } from "../utils";

export * from "./backend/libs";
// Backend modules, libs, plugins, utils
export * from "./backend/modules/user";
export * from "./backend/plugins/err";
export * from "./backend/plugins/logger";
export * from "./backend/utils/Res";
export * from "./backend-types";
export * from "./bot";
export * from "./db";
export * from "./elysia";
export * from "./env";
export * from "./eslint";
export * from "./install";
export * from "./package/backend-package.json";
export * from "./package/package.json";
export * from "./readme.md";
export * from "./services/auth";
export * from "./tsconfig";
export * from "./tsconfig.json";
export * from "./turbo.json";
export * from "./types";
export * from "./vue";
export * from "./vue/eden-client";

const dbExportedMap = {
	Prisma: "prisma",
	Drizzle: "client",
};

export function getIndex({
	others,
	orm,
	driver,
	telegramRelated,
	isMonorepo,
}: PreferencesType) {
	const isShouldConnectToDB =
		orm !== "None" &&
		driver !== "Postgres.JS" &&
		driver !== "MySQL 2" &&
		driver !== "Bun SQLite" &&
		driver !== "Bun.sql";

	const gracefulShutdownTasks: string[] = [];
	const imports: string[] = [
		// `import { bot } from "./bot.ts"`,
		`import { config } from "./config.ts"`,
	];
	const startUpTasks: string[] = [];

	imports.push(`import { app } from "./server.ts"`);
	imports.push(`import packageJson from "../package.json"`);
	imports.push(`import { startupHealthCheck } from "./libs/healthyCheck";`);
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

	if (telegramRelated && !isMonorepo) {
		imports.push(`import { bot } from "./bot.ts"`);
		startUpTasks.push(dedent /* tss */`
	        if (config.NODE_ENV === "production")
	            await bot.start({
	                webhook: {
	                    url: \`\${config.API_URL}/\${config.BOT_TOKEN}\`,
	                },
	            });
	        else await bot.start();`);
	}

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

    // 启动 HTTP 服务器
    const elysia = app.listen(config.PORT, () => {
      console.log(\`🦊 Server started at \${app.server?.url.origin}\`);
    });

    // 健康检查（可选，异步不阻塞）
    startupHealthCheck().catch(console.error);

    // 启动日志
    (() => {
      if (config.NODE_ENV === "production") {
      console.log(\`当前环境：生产环境\${config.APP_URL ? ': ' + config.APP_URL : ''}\`);
        console.log("版本号:", packageJson.version);
      } else {
        console.log("当前环境：开发环境");
        console.log("版本号:", packageJson.version);
      }
    })();

    export type EndApp = typeof elysia;
${startUpTasks.join("\n")}`;
}
