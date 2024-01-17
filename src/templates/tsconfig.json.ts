import { Preferences } from "../utils";

export function getTSConfig({}: Preferences) {
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
			},
		},
		null,
		2,
	);
}
