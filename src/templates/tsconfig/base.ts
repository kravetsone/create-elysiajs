export function getTSConfigBase() {
	return JSON.stringify(
		{
			$schema: "https://json.schemastore.org/tsconfig",
			compilerOptions: {
				declaration: true,
				declarationMap: true,
				esModuleInterop: true,
				incremental: true,
				isolatedModules: true,
				lib: ["ES2022", "DOM", "DOM.Iterable"],
				target: "ES2022",
				module: "ESNext",
				moduleResolution: "bundler",
				moduleDetection: "force",
				noUncheckedIndexedAccess: true,
				resolveJsonModule: true,
				skipLibCheck: true,
				strict: true,
				allowJs: true,
				composite: true,
			},
		},
		null,
		2,
	);
}
