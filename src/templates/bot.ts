import dedent from "ts-dedent";

export function getBotFile() {
	return dedent /* ts */`
	import { Bot } from "gramio";
    import { config } from "./config.ts";

	export const bot = new Bot(config.BOT_TOKEN)
        .onStart(({ info }) => console.log(\`✨ Bot \${info.username} was started!\`))`;
}
