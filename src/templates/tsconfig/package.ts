// tsconfig package
export function getTypeScriptConfigPackageJson(projectName: string) {
	return JSON.stringify(
		{
			name: `@${projectName}/tsconfig`,
			version: "0.0.0",
			private: true,
			publishConfig: {
				access: "public",
			},
			devDependencies: {
				"@vue/tsconfig": "^0.5.1",
			},
		},
		null,
		2,
	);
}
