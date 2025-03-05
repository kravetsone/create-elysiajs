import type { Preferences } from "../utils";

export function getTSConfig({ plugins }: Preferences) {
	return JSON.stringify(
		{
			compilerOptions: {
				lib: ["ESNext"],
				module: "NodeNext",
				target: "ESNext",
				moduleResolution: "NodeNext",
				esModuleInterop: true,
				strict: true,
				skipLibCheck: true,
				allowSyntheticDefaultImports: true,
				noEmit: true,
				allowImportingTsExtensions: true,
				noUncheckedIndexedAccess: true,
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
		},
		null,
		2,
	);
}
