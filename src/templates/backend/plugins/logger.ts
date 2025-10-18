export function getLoggerPlugin() {
  return `import { Elysia } from "elysia";

export const logPlugin = new Elysia()
	.onTransform(function log({ body, params, path, request: { method } }) {
		console.log(\`\${method} \${path}\`, {
			body,
			params,
		});
	})
	.as("global");
`;
}