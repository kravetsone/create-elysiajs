import fs from "node:fs/promises";
import {
	getDBIndex,
	getEnvFile,
	getReadme,
	getTSConfigBase,
	getTurboJson,
} from "../templates";
import { getCommonSchemas } from "../templates/backend/libs/common-schemas";
import { getConnection } from "../templates/backend/libs/connection";
import { getHealthyCheck } from "../templates/backend/libs/healthyCheck";
import { getSchemaHelper } from "../templates/backend/libs/schemaHelper";
import { getUserModuleIndex } from "../templates/backend/modules/user";
import { getUsersController } from "../templates/backend/modules/user/users.controller";
import { getUsersModel } from "../templates/backend/modules/user/users.model";
import { getUsersService } from "../templates/backend/modules/user/users.service";
import { getErrorIndex } from "../templates/backend/plugins/err";
import { getErrorBase } from "../templates/backend/plugins/err/base";
import { getDatabaseErrorMapper } from "../templates/backend/plugins/err/database-error-mapper";
import { getErrorPlugin } from "../templates/backend/plugins/err/err.plugin";
import { getErrorGuards } from "../templates/backend/plugins/err/guards";
import { getHttpErrors } from "../templates/backend/plugins/err/http-error";
import { getLoggerPlugin } from "../templates/backend/plugins/logger";
import { getRes } from "../templates/backend/utils/Res";
import { getBackendTypes } from "../templates/backend-types";
import { getBotFile } from "../templates/bot";
import { getBackendPackageJson } from "../templates/package/backend-package.json";
import { getPackageJson } from "../templates/package/package.json";
import { getAuthPlugin } from "../templates/services/auth";
import {
	getBackendTSConfig,
	getElysiaTSConfig,
	getFrontendTSConfig,
	getNodeTSConfig,
	getTypeScriptConfigPackageJson,
} from "../templates/tsconfig";
import { getAppTSConfig } from "../templates/tsconfig/app";
import {
	getAppVue,
	getEnvDTs,
	getFrontendPackageJson,
	getHomeVue,
	getIndexHTML,
	getViteConfig,
	getVueMain,
} from "../templates/vue";
import { getHandleApi } from "../templates/vue/handleApi";
import { getMainCSS } from "../templates/vue/main.css";
import { getRouter } from "../templates/vue/router";
import { getUseApiWithToast } from "../templates/vue/useApiWithToast";
import { getUseTreaty } from "../templates/vue/useTreaty";
import type { PreferencesType } from "../utils";
import {
	generateBackendDirectories,
	generateCommonBackendFiles,
	generateDatabaseFiles,
} from "./utils/backend-helpers";
import {
	collectCommonBackendPreferences,
	collectFrontendPreferences,
	collectTelegramPreferences,
} from "./utils/preference-collectors";

export async function generateMonorepo(
	projectDir: string,
	preferences: PreferencesType,
) {
	try {
		// Generate monorepo structure
		await generateMonorepoStructure(projectDir, preferences);

		// Generate backend application (reuse single app logic)
		await generateBackendApp(projectDir, preferences);

		// Generate frontend application (if needed)
		if (preferences.frontend !== "None") {
			await generateFrontendApp(projectDir, preferences);
		}
	} catch (error) {
		// Clean up partial state or re-throw with context
		throw new Error(
			`Failed to generate monorepo: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}

export async function collectMonorepoPreferences(preferences: PreferencesType) {
	// Collect Telegram preference
	await collectTelegramPreferences(preferences, {
		initial: "yes",
		message: "Do you want to include Telegram bot support?",
	});

	// Collect frontend preference (monorepo-specific)
	await collectFrontendPreferences(preferences, {
		choices: ["None", "Vue"],
		message: "Select frontend framework: (currently only Vue supported)",
	});

	// Collect common backend preferences with monorepo-specific options
	await collectCommonBackendPreferences(preferences, {
		linterChoices: ["None", "Biome"], // Monorepo prefers Biome
		ormChoices: ["None", "Drizzle"], // Monorepo focuses on Drizzle
		includePrismaDatabases: false, // Monorepo doesn't include Prisma options
	});
}

async function generateMonorepoStructure(
	projectDir: string,
	preferences: PreferencesType,
) {
	// Root directory files
	await fs.writeFile(`${projectDir}/package.json`, getPackageJson(preferences));
	await fs.writeFile(`${projectDir}/turbo.json`, getTurboJson());
	await fs.writeFile(
		`${projectDir}/.gitignore`,
		["dist", "node_modules", ".env", ".env.production", ".turbo"].join("\n"),
	);
	await fs.writeFile(`${projectDir}/README.md`, getReadme(preferences));
	// Create packages directory
	await fs.mkdir(`${projectDir}/packages`);

	// Create tsconfig package
	await fs.mkdir(`${projectDir}/packages/tsconfig`);
	await fs.writeFile(
		`${projectDir}/packages/tsconfig/package.json`,
		getTypeScriptConfigPackageJson(preferences.projectName),
	);
	await fs.writeFile(
		`${projectDir}/packages/tsconfig/base.json`,
		getTSConfigBase(),
	);
	await fs.writeFile(
		`${projectDir}/packages/tsconfig/elysia.json`,
		getElysiaTSConfig(),
	);
	await fs.writeFile(
		`${projectDir}/packages/tsconfig/vue.json`,
		getFrontendTSConfig("Vue"),
	);
	await fs.writeFile(
		`${projectDir}/packages/tsconfig/node.json`,
		getNodeTSConfig(),
	);

	// Create apps directory
	await fs.mkdir(`${projectDir}/apps`);
}

async function generateBackendApp(
	projectDir: string,
	preferences: PreferencesType,
) {
	const backendDir = `${projectDir}/apps/backend`;

	// Create backend application directory and files
	await fs.mkdir(backendDir);
	await fs.writeFile(
		`${backendDir}/package.json`,
		getBackendPackageJson(preferences),
	);
	await fs.writeFile(
		`${backendDir}/tsconfig.json`,
		getBackendTSConfig(preferences.plugins),
	);

	// Generate backend directory structure
	const { baseDir, srcDir } = await generateBackendDirectories(
		projectDir,
		true,
	); // isMonorepo

	// Use shared utilities to generate common backend files
	await generateCommonBackendFiles(
		projectDir,
		preferences,
		true, // isMonorepo
	);

	// Create user module example
	await fs.writeFile(`${srcDir}/modules/user/index.ts`, getUserModuleIndex());
	await fs.writeFile(`${srcDir}/modules/user/users.model.ts`, getUsersModel());
	await fs.writeFile(
		`${srcDir}/modules/user/users.service.ts`,
		getUsersService(),
	);
	await fs.writeFile(
		`${srcDir}/modules/user/users.controller.ts`,
		getUsersController(),
	);

	// Generate database related files
	if (preferences.orm !== "None") {
		await fs.writeFile(`${srcDir}/libs/index.ts`, getDBIndex(preferences));

		// Generate libs auxiliary files
		await fs.writeFile(`${srcDir}/libs/schemaHelper.ts`, getSchemaHelper());
		await fs.writeFile(`${srcDir}/libs/common-schemas.ts`, getCommonSchemas());
		await fs.writeFile(`${srcDir}/libs/connection.ts`, getConnection());
		await fs.writeFile(`${srcDir}/libs/healthyCheck.ts`, getHealthyCheck());

		// Use shared utilities to generate database files
		await generateDatabaseFiles(projectDir, preferences, true); // isMonorepo
	}

	// plugins directory already created in generateBackendDirectories

	// Create logger plugin
	await fs.writeFile(`${backendDir}/src/plugins/logger.ts`, getLoggerPlugin());

	// Create error handling plugin directory and files
	// plugins/err directory already created in generateBackendDirectories
	await fs.writeFile(`${backendDir}/src/plugins/err/base.ts`, getErrorBase());
	await fs.writeFile(
		`${backendDir}/src/plugins/err/http-error.ts`,
		getHttpErrors(),
	);
	await fs.writeFile(
		`${backendDir}/src/plugins/err/guards.ts`,
		getErrorGuards(),
	);
	await fs.writeFile(
		`${backendDir}/src/plugins/err/database-error-mapper.ts`,
		getDatabaseErrorMapper(),
	);
	await fs.writeFile(`${backendDir}/src/plugins/err/index.ts`, getErrorIndex());
	await fs.writeFile(
		`${backendDir}/src/plugins/err/err.plugin.ts`,
		getErrorPlugin(),
	);

	if (preferences.telegramRelated) {
		await fs.writeFile(
			`${backendDir}/src/plugins/auth.plugin.ts`,
			getAuthPlugin(),
		);
	}

	// utils and types directories already created in generateBackendDirectories
	await fs.writeFile(`${backendDir}/src/utils/Res.ts`, getRes());

	// Generate type definition files
	await fs.writeFile(
		`${backendDir}/src/types/index.ts`,
		getBackendTypes(preferences),
	);

	// Generate bot file
	if (preferences.telegramRelated) {
		await fs.writeFile(`${backendDir}/src/bot.ts`, getBotFile());
	}
}

async function generateFrontendApp(
	projectDir: string,
	preferences: PreferencesType,
) {
	const frontendDir = `${projectDir}/apps/frontend`;

	await fs.mkdir(frontendDir);

	// Create frontend .env file
	await fs.writeFile(
		`${frontendDir}/.env`,
		`VITE_API_URL=http://localhost:5000`,
	);
	await fs.writeFile(
		`${frontendDir}/.env.production`,
		getEnvFile(preferences, true),
	);

	await fs.writeFile(
		`${frontendDir}/package.json`,
		getFrontendPackageJson(preferences),
	);

	if (preferences.frontend === "Vue") {
		// First create necessary directory structure
		await fs.mkdir(`${frontendDir}/src`);
		await fs.mkdir(`${frontendDir}/src/pages`);
		await fs.mkdir(`${frontendDir}/src/components`);
		await fs.mkdir(`${frontendDir}/src/assets`);
		await fs.mkdir(`${frontendDir}/src/assets/styles`);
		await fs.mkdir(`${frontendDir}/src/utils`);
		await fs.mkdir(`${frontendDir}/src/utils/api`);
		await fs.mkdir(`${frontendDir}/src/router`);
		await fs.mkdir(`${frontendDir}/public`);

		// Configuration files
		await fs.writeFile(
			`${frontendDir}/tsconfig.json`,
			getFrontendTSConfig(preferences.frontend),
		);
		await fs.writeFile(`${frontendDir}/tsconfig.node.json`, getNodeTSConfig());

		await fs.writeFile(`${frontendDir}/tsconfig.app.json`, getAppTSConfig());
		await fs.writeFile(
			`${frontendDir}/vite.config.ts`,
			getViteConfig(preferences.frontend),
		);
		await fs.writeFile(
			`${frontendDir}/index.html`,
			getIndexHTML(preferences.projectName),
		);

		// Main files
		await fs.writeFile(`${frontendDir}/src/main.ts`, getVueMain());
		await fs.writeFile(
			`${frontendDir}/src/App.vue`,
			getAppVue(preferences.projectName),
		);
		await fs.writeFile(`${frontendDir}/src/pages/Home.vue`, getHomeVue());
		await fs.writeFile(`${frontendDir}/src/env.d.ts`, getEnvDTs());

		// Style files
		await fs.writeFile(
			`${frontendDir}/src/assets/styles/main.css`,
			getMainCSS(),
		);

		// Router files
		await fs.writeFile(`${frontendDir}/src/router/index.ts`, getRouter());

		// API utility files
		await fs.writeFile(
			`${frontendDir}/src/utils/api/useTreaty.ts`,
			getUseTreaty(),
		);
		await fs.writeFile(
			`${frontendDir}/src/utils/api/useApiWithToast.ts`,
			getUseApiWithToast(),
		);
		await fs.writeFile(
			`${frontendDir}/src/utils/api/handleApi.ts`,
			getHandleApi(),
		);
	}
}
