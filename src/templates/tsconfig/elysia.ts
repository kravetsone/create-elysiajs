export function getElysiaTSConfig() {
	return JSON.stringify(
		{
			$schema: "https://json.schemastore.org/tsconfig",
			extends: "./base.json",
			compilerOptions: {
				noUncheckedIndexedAccess: true,
				module: "ESNext",
				moduleResolution: "bundler",
				target: "ES2022",
			},
		},
		null,
		2,
	);
}
