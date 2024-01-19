import { Preferences } from "../utils";

export function getInstallCommands({ linter, orm, database }: Preferences) {
	const commands: string[] = [];

	commands.push("bun install");
	if (orm === "Prisma")
		commands.push(`bunx prisma init --datasource-provider ${database}`);
	if (linter === "Biome") commands.push("bunx @biomejs/biome init");
	if (linter !== "None") commands.push("bun lint:fix");

	return commands;
}
