import type { PreferencesType } from "../utils.js";

export function generateEslintConfig({ orm }: PreferencesType) {
	return [
		`import antfu from "@antfu/eslint-config"`,
		orm === "Drizzle" && `import drizzle from "eslint-plugin-drizzle";`,
		`
export default antfu(
  {
  },
  {
        files: ["**/*.js", "**/*.ts"],`,
		orm === "Drizzle" &&
			`plugins: {
			drizzle,
		},
	},
);
`,
	].join("\n");
}
