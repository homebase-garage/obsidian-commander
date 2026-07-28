import { defineConfig } from "vitest/config";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	test: {
		environment: "jsdom",
		globals: false,
		setupFiles: ["src/__tests__/setup.ts"],
	},
	resolve: {
		alias: [
			{
				find: "obsidian",
				replacement: path.resolve(__dirname, "src/__tests__/__mocks__/obsidian.ts"),
			},
			{
				find: /.*\/l10n$/,
				replacement: path.resolve(__dirname, "src/__tests__/__mocks__/l10n.ts"),
			},
			{
				find: "src",
				replacement: path.resolve(__dirname, "src"),
			},
		],
	},
});
