import { describe, it, expect } from "vitest";
import { isModeActive } from "../util";
import type CommanderPlugin from "../main";

function makePlugin(isMobile: boolean, appId = "desktop-app"): CommanderPlugin {
	return {
		app: { isMobile, appId },
	} as unknown as CommanderPlugin;
}

describe("isModeActive", () => {
	it('returns true for mode "any" on desktop', () => {
		expect(isModeActive("any", makePlugin(false))).toBe(true);
	});

	it('returns true for mode "any" on mobile', () => {
		expect(isModeActive("any", makePlugin(true))).toBe(true);
	});

	it('returns true for mode "desktop" when not mobile', () => {
		expect(isModeActive("desktop", makePlugin(false))).toBe(true);
	});

	it('returns false for mode "desktop" when on mobile', () => {
		expect(isModeActive("desktop", makePlugin(true))).toBe(false);
	});

	it('returns true for mode "mobile" when on mobile', () => {
		expect(isModeActive("mobile", makePlugin(true))).toBe(true);
	});

	it('returns false for mode "mobile" when on desktop', () => {
		expect(isModeActive("mobile", makePlugin(false))).toBe(false);
	});

	it("returns true when mode matches the appId", () => {
		expect(isModeActive("my-vault", makePlugin(false, "my-vault"))).toBe(true);
	});

	it("returns false when mode does not match appId and is not any/mobile/desktop", () => {
		expect(isModeActive("other-vault", makePlugin(false, "my-vault"))).toBe(false);
	});
});
