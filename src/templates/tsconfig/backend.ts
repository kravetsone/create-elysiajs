export function getBackendTSConfig(plugins: string[] = []) {
	return JSON.stringify(
		{
			$schema: "https://json.schemastore.org/tsconfig",
			extends: "@repo/tsconfig/elysia.json",
			compilerOptions: {
				incremental: true,
				tsBuildInfoFile: "./dist/.tsbuildinfo",
				baseUrl: ".",
				paths: {
					"@backend/*": ["src/*"],
				},
				...(plugins.includes("HTML/JSX")
					? {
							jsx: "react",
							jsxFactory: "Html.createElement",
							jsxFragmentFactory: "Html.Fragment",
							plugins: [{ name: "@kitajs/ts-html-plugin" }],
						}
					: {}),
			},
			include: ["src"],
			exclude: ["node_modules", "dist"],
		},
		null,
		2,
	);
}
