import { Preferences } from "../utils";

export function getPackageJson({ dir, linter, packageManager, orm }: Preferences) {
	const sample = {
		name: dir,
		scripts: {},
		dependencies: {
			elysia: "^0.8.9",
		},
		devDependencies: {
			typescript: "^5.3.3",
		},
		//TODO: delete any
	} as any;

	if (packageManager === "bun") sample.devDependencies["@types/bun"] = "^1.0.2";

	if (linter === "Biome") {
		sample.scripts.lint = "bunx @biomejs/biome check src";
		sample.scripts["lint:fix"] = "bun lint --apply";
		sample.devDependencies["@biomejs/biome"] = "^1.5.2";
	}
	if (linter === "ESLint") {
		sample.scripts.lint = `bunx eslint \"src/**/*.ts\"`;
		sample.scripts["lint:fix"] = `bunx eslint \"src/**/*.ts\" --fix`;
		sample.devDependencies.eslint = "^8.56.0";
		sample.devDependencies["eslint-config-standard"] = "^17.1.0";
		sample.devDependencies["eslint-plugin-promise"] = "^6.1.1";
		sample.devDependencies["eslint-plugin-import"] = "^2.29.1";
		sample.devDependencies["eslint-plugin-n"] = "^16.6.2";
	}

	if(orm === "Prisma") {
		sample.devDependencies.prisma = "^5.8.1";
		sample.dependencies["@prisma/client"] = "^5.8.1";
	}

	// TODO: rewrite
	if (!Object.keys(sample.scripts).length) delete sample.scripts;

	return JSON.stringify(sample, null, 2);
}
