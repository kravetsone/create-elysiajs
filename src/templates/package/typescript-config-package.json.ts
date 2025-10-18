export function getTypeScriptConfigPackageJson(projectName: string) {
	return JSON.stringify(
		{
			name: `@${projectName}/tsconfig`,
			version: "0.0.0",
			private: true,
			type: "module",
			main: "index.js",
			types: "index.d.ts",
			files: ["*.json", "*.js", "*.d.ts"],
			exports: {
				"./base": "./base.json",
				"./backend": "./backend.json",
				"./frontend": "./frontend.json",
				"./node": "./node.json",
				"./next": "./next.json",
				"./react": "./react.json",
				"./vue": "./vue.json",
			},
		},
		null,
		2,
	);
}
