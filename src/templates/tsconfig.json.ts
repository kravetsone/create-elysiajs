import { Preferences } from "../utils";

export function getTSConfig({ plugins }: Preferences) {
	return JSON.stringify(
		{
			compilerOptions: {
				lib: ["ESNext"],
				module: "ESNext",
				target: "ESNext",
				moduleResolution: "Bundler",
				esModuleInterop: true,
				strict: true,
				skipLibCheck: true,
				allowSyntheticDefaultImports: true,
				rootDir: "./src",
				noEmit: true,
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
