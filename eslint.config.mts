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
		files: ['src/main.ts'],
		rules: {
			// Renaming this command's id would break existing users' saved hotkeys
			'obsidianmd/commands/no-command-in-command-id': 'off',
		},
	},
);
