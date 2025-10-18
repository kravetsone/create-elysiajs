import { dependencies } from "../../deps";

export function getTypesPackageJson(projectName: string) {
	const typesPackage = {
		name: `@${projectName}/types`,
		version: "0.0.1",
		private: true,
		type: "module",
		main: "index.ts",
		types: "index.ts",
		scripts: {
			build: "rimraf dist && tsc",
			"type-check": "tsc --noEmit",
			clean: "rimraf dist node_modules",
		},
		devDependencies: {
			typescript: dependencies.typescript,
			"@types/bun": dependencies["@types/bun"],
			rimraf: dependencies.rimraf,
		},
		files: ["dist", "index.ts"],
	};

	return JSON.stringify(typesPackage, null, 2);
}
