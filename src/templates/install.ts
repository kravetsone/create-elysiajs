import { Preferences } from "../utils";

export function getInstallCommands({
	linter,
	orm,
	database,
	git,
}: Preferences) {
	const commands: string[] = [];

	if (git) commands.push("git init");
	commands.push("bun install");
	if (orm === "Prisma")
		commands.push(`bunx prisma init --datasource-provider ${database}`);
	if (linter === "Biome") commands.push("bunx @biomejs/biome init");
	if (linter !== "None") commands.push("bun lint:fix");

	return commands;
}
