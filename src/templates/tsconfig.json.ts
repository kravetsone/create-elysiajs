import { Preferences } from "../utils";

export function getTSConfig() {
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
			include: ["src"],
		},
		null,
		2,
	);
}
