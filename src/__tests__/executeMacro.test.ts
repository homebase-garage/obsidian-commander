import { describe, it, expect, vi } from "vitest";
import { Action } from "../types";
import type { Macro } from "../types";
import type CommanderPlugin from "../main";
import CommanderPluginClass from "../main";

function buildPlugin(macros: Macro[]): CommanderPlugin {
	const executeCommandById = vi.fn();
	const plugin = {
		settings: { macros },
		app: {
			commands: { executeCommandById },
		},
	} as unknown as CommanderPlugin;
	plugin.executeMacro = CommanderPluginClass.prototype.executeMacro.bind(plugin);
	return plugin;
}

describe("executeMacro", () => {
	it("throws when macro id does not exist", async () => {
		const plugin = buildPlugin([]);
		await expect(plugin.executeMacro(99)).rejects.toThrow("Macro not found");
	});

	it("executes COMMAND actions by calling executeCommandById", async () => {
		const macro: Macro = {
			name: "test",
			icon: "check",
			macro: [
				{ action: Action.COMMAND, commandId: "editor:undo" },
				{ action: Action.COMMAND, commandId: "editor:redo" },
			],
		};
		const plugin = buildPlugin([macro]);
		await plugin.executeMacro(0);
		const spy = plugin.app.commands.executeCommandById as ReturnType<typeof vi.fn>;
		expect(spy).toHaveBeenCalledTimes(2);
		expect(spy).toHaveBeenNthCalledWith(1, "editor:undo");
		expect(spy).toHaveBeenNthCalledWith(2, "editor:redo");
	});

	it("executes LOOP action the correct number of times", async () => {
		const macro: Macro = {
			name: "loop-test",
			icon: "star",
			macro: [{ action: Action.LOOP, times: 3, commandId: "some:command" }],
		};
		const plugin = buildPlugin([macro]);
		await plugin.executeMacro(0);
		const spy = plugin.app.commands.executeCommandById as ReturnType<typeof vi.fn>;
		expect(spy).toHaveBeenCalledTimes(3);
	});

	it("handles DELAY action without throwing", async () => {
		const macro: Macro = {
			name: "delay-test",
			icon: "home",
			macro: [{ action: Action.DELAY, delay: 0 }],
		};
		const plugin = buildPlugin([macro]);
		await expect(plugin.executeMacro(0)).resolves.toBeUndefined();
	});

	it("handles EDITOR action without throwing", async () => {
		const macro: Macro = {
			name: "editor-test",
			icon: "home",
			macro: [{ action: Action.EDITOR }],
		};
		const plugin = buildPlugin([macro]);
		await expect(plugin.executeMacro(0)).resolves.toBeUndefined();
	});

	it("executes mixed action sequence in correct order", async () => {
		const macro: Macro = {
			name: "mixed",
			icon: "check",
			macro: [
				{ action: Action.COMMAND, commandId: "cmd-1" },
				{ action: Action.DELAY, delay: 0 },
				{ action: Action.COMMAND, commandId: "cmd-2" },
			],
		};
		const plugin = buildPlugin([macro]);
		await plugin.executeMacro(0);
		const spy = plugin.app.commands.executeCommandById as ReturnType<typeof vi.fn>;
		expect(spy.mock.calls.map((c: string[]) => c[0])).toEqual(["cmd-1", "cmd-2"]);
	});
});
