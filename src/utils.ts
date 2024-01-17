import { PackageManager } from "./types";

export function detectPackageManager() {
	const userAgent = process.env.npm_config_user_agent;

	if (!userAgent)
		throw new Error(
			`Package manager was not detected. Please specify template with "--template bun"`,
		);

	return userAgent.split(" ")[0].split("/")[0] as PackageManager;
}

export class Preferences {
	dir = "";
	packageManager: PackageManager = "bun";
	linter: "ESLint" | "Biome" | "None" = "None";
}
