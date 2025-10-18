import { dependencies } from "../../deps";
import { ShareDeps } from "../../deps.share";
import { getSingleAppDepsAndScripts, type Preferences, pmExecuteMap } from "../../utils";

export function getBackendPackageJson({
	projectName,
	packageManager,
	orm,
	driver,
	others,
	plugins,
	redis,
	mockWithPGLite,
	telegramRelated,
	s3Client,
}: Preferences) {
	// Get plugin dependencies with proper type classification
	const { dependencies: pluginDeps, devDependencies: pluginDevDeps, scripts: pluginScripts } =
		getSingleAppDepsAndScripts(plugins, {
			linter: "Biome", // Backend always uses Biome in monorepo
			orm,
			driver,
			others,
			redis,
			mockWithPGLite,
			telegramRelated,
			s3Client,
			packageManager,
		});

	const sample = {
		name: `@${projectName}/backend`,
		version: "0.0.1",
		module: "index.ts",
		type: "module",
		private: true,
		scripts: {
			build:
				"rimraf dist && NODE_ENV=production bun build --target bun --minify-whitespace --minify-syntax --outfile ./dist/index.js src/index.ts",
			dev: "bun --watch src/index.ts",
			clean: "rimraf dist node_modules",
			"type-check": "bun --bun tsc --noEmit",
			lint: "biome check",
			"lint:fix": "biome check --write",
			start: "bun --env-file=.env --env-file=.env.production ./dist/index.js",
			...pluginScripts, // Merge plugin-specific scripts
		} as Record<string, string>,
		dependencies: {
			elysia: ShareDeps.elysia,
			"env-var": dependencies["env-var"],
			...pluginDeps, // Merge runtime dependencies from plugins
		} as Record<string, string>,
		devDependencies: {
			"@repo/tsconfig": "workspace:*",
			"@types/bun": ShareDeps["@types/bun"],
			typescript: ShareDeps.typescript,
			rimraf: ShareDeps.rimraf,
			"@biomejs/biome": dependencies["@biomejs/biome"],
			"@elysiajs/eden": dependencies["@elysiajs/eden"], // Eden for frontend type support
			...pluginDevDeps, // Merge dev dependencies from plugins
		} as Record<string, string>,
	};

	return JSON.stringify(sample, null, 2);
}
