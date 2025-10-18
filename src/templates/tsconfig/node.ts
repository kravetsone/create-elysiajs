export function getNodeTSConfig() {
	return JSON.stringify(
		{
			compilerOptions: {
				target: "ES2022",
				lib: ["ES2022"],
				module: "ESNext",
				skipLibCheck: true,
				/* Bundler mode */
				moduleResolution: "bundler",
				allowImportingTsExtensions: true,
				verbatimModuleSyntax: true,
				moduleDetection: "force",
				noEmit: true,
				/* Linting */
				strict: true,
				noUnusedLocals: true,
				noUnusedParameters: true,
				erasableSyntaxOnly: true,
				noFallthroughCasesInSwitch: true,
				noUncheckedSideEffectImports: true,
			},
			include: ["vite.config.ts"],
		},
		null,
		2,
	);
}
