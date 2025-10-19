export function getTypesTSConfig() {
	const tsconfig = {
		extends: "../tsconfig/base.json",
		compilerOptions: {
			outDir: "./dist",
			rootDir: "./",
			declaration: true,
			declarationMap: true,
			composite: true,
			incremental: true,
		},
		include: ["./**/*.ts"],
		exclude: ["node_modules", "dist"],
	};

	return JSON.stringify(tsconfig, null, 2);
}
