import { Preferences } from "../utils";

export function getPackageJson({ dir, linter }: Preferences) {
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

	if (linter === "Biome") {
		sample.scripts.lint = "bunx @biomejs/biome check src/{**,}/*.ts";
		sample.scripts["lint:fix"] =
			"bunx @biomejs/biome check src/{**,}/*.ts --apply";
		sample.devDependencies["@biomejs/biome"] = "^1.5.2";
	}
	if (linter === "ESLint") {
		sample.scripts.lint = "bunx eslint src/{**,}/*.ts";
		sample.scripts["lint:fix"] = "bunx eslint src/{**,}/*.ts --fix";
		sample.devDependencies.eslint = "^8.56.0";
	}

    // TODO: rewrite
    if(!Object.keys(sample.scripts).length) delete sample.scripts;

	return JSON.stringify(sample, null, 2);
}
