export function getAppTSConfig() {
	return JSON.stringify(
		{
			extends: "@repo/tsconfig/vue.json",
			compilerOptions: {
				baseUrl: ".",
				paths: {
					"@/*": ["./src/*"],
					"@backend/*": ["../backend/src/*"],
				},
			},
			include: [
				"src/**/*.ts",
				"src/**/*.tsx",
				"src/**/*.vue",
				"../backend/src/index",
				"../backend/src/types/*.ts",
			],
			references: [
				{
					path: "../backend",
				},
			],
		},
		null,
		2,
	);
}
