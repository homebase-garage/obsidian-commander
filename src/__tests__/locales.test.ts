import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOCALE_DIR = path.resolve(__dirname, "../../locale");

function loadJson(file: string): Record<string, string> {
	return JSON.parse(readFileSync(path.join(LOCALE_DIR, file), "utf-8"));
}

// Extract all {{placeholder}} tokens from a string
function placeholders(str: string): string[] {
	return [...str.matchAll(/\{\{[^}]+\}\}/g)].map((m) => m[0]).sort();
}

const en = loadJson("en.json");
const enKeys = Object.keys(en);

const localeFiles = readdirSync(LOCALE_DIR).filter(
	(f) => f.endsWith(".json") && f !== "en.json"
);

// Only validate locales that have been filled in (not empty stubs)
const filledLocales = localeFiles.filter((f) => {
	const data = loadJson(f);
	return Object.keys(data).length > 0;
});

describe("locale completeness (non-empty locales only)", () => {
	it.each(filledLocales)("%s has no missing keys", (file) => {
		const data = loadJson(file);
		const missing = enKeys.filter((k) => !(k in data));
		expect(missing, `Missing keys in ${file}`).toEqual([]);
	});

	it.each(filledLocales)("%s has no extra keys not in en.json", (file) => {
		const data = loadJson(file);
		const extra = Object.keys(data).filter((k) => !(k in en));
		expect(extra, `Extra keys in ${file}`).toEqual([]);
	});

	it.each(filledLocales)("%s preserves all {{placeholders}}", (file) => {
		const data = loadJson(file);
		const mismatches: string[] = [];
		for (const key of enKeys) {
			if (!(key in data)) continue;
			const expected = placeholders(en[key]);
			const actual = placeholders(data[key]);
			if (JSON.stringify(expected) !== JSON.stringify(actual)) {
				mismatches.push(
					`"${key}": expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
				);
			}
		}
		expect(mismatches, `Placeholder mismatches in ${file}`).toEqual([]);
	});
});
