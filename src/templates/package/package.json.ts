import { dependencies } from "../../deps";
import {
	getMonorepoRootDepsAndScripts,
	getSingleAppDepsAndScripts,
	type Preferences,
	pmExecuteMap,
} from "../../utils";

export function getPackageJson({
	projectName,
	linter,
	packageManager,
	orm,
	driver,
	others,
	plugins,
	isMonorepo,
	redis,
	mockWithPGLite,
	telegramRelated,
	s3Client,
}: Preferences) {
	const deps: Record<string, string> = {};
	const devDeps: Record<string, string> = {};
	const scripts: Record<string, string> = {};
	if (isMonorepo) {
		const { devDependencies: extraDeps, scripts: extraScripts } =
			getMonorepoRootDepsAndScripts({
				linter,
				orm,
				others,
				packageManager,
				mockWithPGLite,
			});

		const rootPackage = {
			name: projectName,
			private: true,
			type: "module",
			packageManager: `${packageManager}@latest`,
			workspaces: ["packages/*", "apps/*"],
			scripts: {
				build: "turbo run build",
				dev: "turbo run dev",
				start: "turbo run start",
				"check-types": "turbo run check-types",
				clean: "turbo run clean",
				preclean: "rimraf node_modules dist bun.lockb .turbo",
				...extraScripts, // Merge dynamic scripts!
			},
			engines: { bun: ">=1.3.0" },
			dependencies: {}, // monorepo root generally has no runtime dependencies!
			devDependencies: {
				turbo: dependencies.turbo,
				rimraf: dependencies.rimraf,
				"@types/bun": dependencies["@types/bun"],
				...extraDeps, // Merge dynamic dependencies!
			},
		};

		return JSON.stringify(rootPackage, null, 2);
	}

	// Single application configuration
	const {
		dependencies: pluginDeps,
		devDependencies: pluginDevDeps,
		scripts: pluginScripts,
	} = getSingleAppDepsAndScripts(plugins, {
		linter,
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
		name: projectName,
		type: "module",
		scripts: {
			dev:
				packageManager === "bun"
					? "bun --watch src/index.ts"
					: `${pmExecuteMap[packageManager]} tsx watch --env-file .env src/index.ts`,
			start:
				packageManager === "bun"
					? "NODE_ENV=production bun run ./src/index.ts"
					: `NODE_ENV=production ${pmExecuteMap[packageManager]} tsx --env-file=.env --env-file=.env.production src/index.ts`,
			...pluginScripts, // Merge plugin-specific scripts
		} as Record<string, string>,
		dependencies: {
			elysia: dependencies.elysia,
			"env-var": dependencies["env-var"],
			...pluginDeps, // Merge runtime dependencies from plugins
		} as Record<keyof typeof dependencies, string>,
		devDependencies: {
			typescript: dependencies.typescript,
			"@types/bun": dependencies["@types/bun"],
			...pluginDevDeps, // Merge dev dependencies from plugins
		} as Record<keyof typeof dependencies, string>,
	};

	return JSON.stringify(sample, null, 2);
}
