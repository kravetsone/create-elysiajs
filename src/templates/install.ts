import { Preferences } from "../utils";

export function getInstallCommands(preferences: Preferences) {
	const commands: string[] = [];

	commands.push("bun install");
    if(preferences.linter === "Biome") commands.push("bunx @biomejs/biome init")
    if (preferences.linter !== "None") commands.push("bun lint:fix");
	
    return commands;
}
