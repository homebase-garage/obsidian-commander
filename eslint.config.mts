import tseslint from 'typescript-eslint';
import obsidianmd from 'eslint-plugin-obsidianmd';
import globals from 'globals';
import { defineConfig, globalIgnores } from 'eslint/config';
import { fileURLToPath } from 'url';
import path from 'path';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(
	globalIgnores([
		'node_modules',
		'build',
		'scripts',
		'main.js',
		'main.css',
		'styles.css',
		'tailwind.config.js',
	]),
	{
		languageOptions: {
			globals: {
				...globals.browser,
			},
			parserOptions: {
				projectService: {
					allowDefaultProject: ['eslint.config.mts', 'manifest.json'],
				},
				tsconfigRootDir: dirname,
				extraFileExtensions: ['.json'],
			},
		},
	},
	...tseslint.configs.recommended,
	{
		rules: {
			'@typescript-eslint/ban-ts-comment': 'off',
			'no-prototype-builtins': 'off',
			'@typescript-eslint/no-empty-function': 'error',
			'@typescript-eslint/class-literal-property-style': ['error', 'fields'],
			'@typescript-eslint/explicit-function-return-type': 'error',
			'@typescript-eslint/explicit-member-accessibility': 'error',
		},
	},
	...obsidianmd.configs.recommended,
	{
		files: ['**/*.ts', '**/*.tsx'],
		rules: {
			// Preact discards the return value of JSX event handlers at
			// runtime (unlike React's synthetic events), so async onClick
			// handlers are safe here - only check non-attribute misuse
			// (forEach callbacks, addEventListener, Promise executors, etc).
			'@typescript-eslint/no-misused-promises': [
				'error',
				{ checksVoidReturn: { attributes: false } },
			],
		},
	},
	{
		files: ['src/main.ts'],
		rules: {
			// Renaming this command's id would break existing users' saved hotkeys
			'obsidianmd/commands/no-command-in-command-id': 'off',
		},
	},
	{
		files: ['eslint.config.mts', 'vitest.config.ts', 'src/__tests__/**'],
		rules: {
			// These only run under Node (eslint/vitest CLI), never bundled
			// into main.js or loaded inside Obsidian, so the mobile/runtime
			// compatibility rationale behind these rules doesn't apply here.
			'obsidianmd/no-nodejs-modules': 'off',
			'obsidianmd/no-global-this': 'off',
			'obsidianmd/prefer-create-el': 'off',
		},
	},
	{
		files: ['package.json'],
		rules: {
			// builtin-modules, node-fetch, and npm-run-all are flagged as
			// having more modern replacements. They're dev-only build
			// tooling (used from scripts/, never bundled into main.js), so
			// swapping them carries build-breakage risk for no end-user
			// benefit. Deferred to a dedicated follow-up rather than bundled
			// into this lint-cleanup branch.
			'depend/ban-dependencies': 'off',
		},
	},
);
