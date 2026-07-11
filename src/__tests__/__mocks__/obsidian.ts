// Minimal Obsidian API mock for unit tests

// moment is a global in Obsidian; provide a minimal stub
(globalThis as Record<string, unknown>).moment = { locale: () => "en" };

export const Platform = {
	isDesktop: true,
	isMobile: false,
};

export function setIcon(el: HTMLElement, icon: string): void {
	el.setAttribute("data-icon", icon);
}

export function requireApiVersion(_version: string): boolean {
	return true;
}

export function getIconIds(): string[] {
	return ["check", "x", "star", "home"];
}

export class Plugin {}
export class Modal {}
export class Setting {}
export class FuzzySuggestModal<T> {
	app: unknown;
	constructor(app: unknown) { this.app = app; }
	open() {}
	close() {}
}
export class SuggestModal<T> {
	app: unknown;
	constructor(app: unknown) { this.app = app; }
	open() {}
	close() {}
}
export class PluginSettingTab {
	app: unknown;
	plugin: unknown;
	containerEl: HTMLElement = document.createElement("div");
	constructor(app: unknown, plugin: unknown) { this.app = app; this.plugin = plugin; }
}
