import dedent from "ts-dedent";
import type { Preferences } from "../utils";
import { driverNames, driverNamesToDrizzle } from "./db";

export function getPreloadFile({ redis, driver }: Preferences) {
	const imports: string[] = [];
	const mocks: string[] = [];

	if (redis) {
		imports.push('import redis from "ioredis-mock"');
		mocks.push(
			"mock.module('ioredis', () => ({ Redis: redis, default: redis }))",
		);
	}

	return dedent /* ts */`import { mock } from "bun:test";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
${imports.join("\n")}

console.time("PGLite init");

const pglite = new PGlite();
export const db = drizzle(pglite);

mock.module("${driverNames[driver]}", () => ({ default: () => pglite }));

mock.module("drizzle-orm/${driverNamesToDrizzle[driver]}", () => ({ drizzle }));
${mocks.join("\n")}

await migrate(db, {
  migrationsFolder: join(import.meta.dir, "..", "drizzle"),
});

console.timeEnd("PGLite init");
`;
}

export function getTestsAPIFile() {
	return dedent /* ts */`import { treaty } from "@elysiajs/eden";
    import { app } from "../src/server.ts";

    export const api = treaty(app);`;
}

export function getTestsIndex() {
	return dedent /* ts */`import { describe, it, expect } from "bun:test";
    import { api } from "../api.ts";

    describe("API - /", () => {
        it("/ - should return hello world", async () => {
            const response = await api.index.get();

            expect(response.status).toBe(200);
            expect(response.data).toBe("Hello World");
        });
    });

`;
}

export function getTestSharedFile() {
	return dedent /* ts */`import { signInitData } from "@gramio/init-data";

    export const BOT_TOKEN = "1234567890:ABCDEFGHIJKLMNOPQRSTUVWXYZ";

	export const INIT_DATA = signInitData(
		{
			user: {
				id: 1,
				first_name: "durov",
				username: "durov",
			},
		},
		BOT_TOKEN,
	);
	`;
}
