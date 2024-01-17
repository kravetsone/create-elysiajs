import { Preferences } from "../utils";

export function getElysiaIndex(preferences: Preferences) {
	return [
		`import { Elysia } from "elysia"`,
		``,
		`const app = new Elysia()`,
		`            .listen(3000)`,
		``,
		`console.log(\`🦊 Server started at $\{app.server?.url.origin}\`)`,
	].join("\n");
}
