import { Preferences } from "../utils";

export function getInstallCommands({ linter }: Preferences) {
	const commands: string[] = [];

	commands.push("bun install");
	if (linter === "Biome") commands.push("bunx @biomejs/biome init");
	if (linter !== "None") commands.push("bun lint:fix");

	return commands;
}
