import { Preferences } from "../utils";

export function getInstallCommands({
	linter,
	orm,
	database,
	git,
	others,
}: Preferences) {
	const commands: string[] = [];

	if (git) commands.push("git init");
	commands.push("bun install");
	if (others.includes("Husky") && linter !== "None")
		commands.push(`bunx husky set .husky/pre-commit "bun lint:fix"`);
	if (orm === "Prisma")
		commands.push(`bunx prisma init --datasource-provider ${database}`);
	if (linter === "Biome") commands.push("bunx @biomejs/biome init");
	if (linter !== "None") commands.push("bun lint:fix");

	return commands;
}
