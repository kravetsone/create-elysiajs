export function getLoggerPlugin() {
  return `// WARNING: This logger logs request bodies. Sanitize sensitive fields in production.
import { Elysia } from "elysia";

export const logPlugin = new Elysia()
	.onTransform(function log({ body, params, path, request: { method } }) {
		// TODO: Add sanitization for sensitive fields (passwords, tokens, PII)
		console.log(\`\${method} \${path}\`, {
			body,
			params,
		});
	})
	.as("global");
`;
}