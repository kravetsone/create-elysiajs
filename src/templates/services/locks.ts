import dedent from "ts-dedent";
import type { PreferencesType } from "../../utils";

export function getLocksFile({ redis }: PreferencesType) {
	const imports: string[] = [];
	const stores: string[] = [];

	stores.push("memory: { driver: memoryStore() }");
	imports.push(`import { memoryStore } from '@verrou/core/drivers/memory'`);

	if (redis) {
		stores.push("redis: { driver: redisStore({ connection: redis }) },");
		imports.push(`import { redisStore } from '@verrou/core/drivers/redis'`);
		imports.push(`import { redis } from './redis.ts'`);
	}

	return dedent /* ts */`
	import { Verrou } from "@verrou/core"
    import { config } from "../config.ts"
    ${imports.join("\n")}

    export const verrou = new Verrou({
        default: config.LOCK_STORE,
        stores: {
            ${stores.join(",\n")}
        }
    })
	`;
}
