import { dependencies } from "../../deps";
import { ShareDeps } from "../../deps.share";

import type { Preferences } from "../../utils";

export function getFrontendPackageJson({
	projectName,
	packageManager,
	frontend,
}: Preferences) {
	const sample = {
		name: `@${projectName}/frontend`,
		private: true,
		version: "0.0.0",
		type: "module",
		packageManager: `${packageManager}@latest`,
		scripts: {
			dev: "vite",
			build: "rimraf dist && vite build",
			preview: "vite preview",
			clean: "rimraf node_modules bun.lock dist",
			"type-check": "vue-tsc --noEmit",
			lint: "biome check",
			"lint:fix": "biome check --write",
		},
		dependencies: {} as Record<string, string>,
		devDependencies: {
			"@types/bun": ShareDeps["@types/bun"],
			typescript: ShareDeps.typescript,
			rimraf: ShareDeps.rimraf,
			vite: dependencies.vite,
		} as Record<string, string>,
		bun: {
			ignoredBuiltDependencies: ["esbuild"],
		},
		browserslist: [
			"Android 4.4",
			"iOS >= 9",
			"Chrome >= 49",
			"Firefox >= 31",
			"Safari >= 9.1",
			"Edge >= 13",
			"Opera >= 36",
		],
	};

	// 根据前端框架添加依赖
	if (frontend === "Vue") {
		sample.dependencies.vue = dependencies.vue;
		sample.dependencies["@vueuse/core"] = dependencies["@vueuse/core"];
		sample.dependencies["vue-router"] = dependencies["vue-router"];
		sample.dependencies["vue-sonner"] = dependencies["vue-sonner"] || "^2.0.9";
		sample.dependencies["@elysiajs/eden"] = dependencies["@elysiajs/eden"];
		sample.dependencies["@tailwindcss/vite"] = dependencies["@tailwindcss/vite"] || "^4.1.14";
		sample.dependencies.tailwindcss = dependencies.tailwindcss || "^4.1.14";

		// 添加对后端包的依赖
		sample.dependencies[`@${projectName}/backend`] = `workspace:*`;

		sample.devDependencies["@vitejs/plugin-vue"] =
			dependencies["@vitejs/plugin-vue"];
		sample.devDependencies["@vue/tsconfig"] = dependencies["@vue/tsconfig"];
		sample.devDependencies["vue-tsc"] = dependencies["vue-tsc"];
		sample.devDependencies["@egoist/tailwindcss-icons"] = dependencies["@egoist/tailwindcss-icons"] || "^1.9.0";
		sample.devDependencies["unplugin-auto-import"] = dependencies["unplugin-auto-import"] || "^20.1.0";
		sample.devDependencies["unplugin-vue-components"] = dependencies["unplugin-vue-components"] || "^29.0.0";
		sample.devDependencies["@repo/tsconfig"] = "workspace:*";
	}

	if (frontend === "React") {
		sample.dependencies.react = dependencies.react;
		sample.dependencies["react-dom"] = dependencies["react-dom"];
		sample.dependencies["@tanstack/react-router"] =
			dependencies["@tanstack/react-router"];
		sample.dependencies["@tanstack/react-query"] =
			dependencies["@tanstack/react-query"];
		sample.dependencies.zustand = dependencies.zustand;
		sample.dependencies["@elysiajs/eden"] = dependencies["@elysiajs/eden"];

		sample.devDependencies["@vitejs/plugin-react"] =
			dependencies["@vitejs/plugin-react"];
		sample.devDependencies["@types/react"] = dependencies["@types/react"];
		sample.devDependencies["@types/react-dom"] =
			dependencies["@types/react-dom"];
	}

	if (frontend === "Solid") {
		sample.dependencies["solid-js"] = dependencies["solid-js"];
		sample.dependencies["@solidjs/router"] = dependencies["@solidjs/router"];
		sample.dependencies.zustand = dependencies.zustand;
		sample.dependencies["@elysiajs/eden"] = dependencies["@elysiajs/eden"];

		sample.devDependencies["vite-plugin-solid"] =
			dependencies["vite-plugin-solid"];
	}

	if (frontend === "Svelte") {
		sample.dependencies.svelte = dependencies.svelte;
		sample.dependencies["@sveltejs/kit"] = dependencies["@sveltejs/kit"];
		sample.dependencies.zustand = dependencies.zustand;
		sample.dependencies["@elysiajs/eden"] = dependencies["@elysiajs/eden"];

		sample.devDependencies["@sveltejs/vite-plugin-svelte"] =
			dependencies["@sveltejs/vite-plugin-svelte"];
		sample.devDependencies["@sveltejs/adapter-auto"] =
			dependencies["@sveltejs/adapter-auto"];
	}

	return JSON.stringify(sample, null, 2);
}
