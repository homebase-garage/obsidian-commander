import CommanderPlugin from "src/main";
import { CommandIconPair } from "src/types";

export default abstract class CommandManagerBase {
	public pairs: CommandIconPair[];
	protected plugin: CommanderPlugin;

	public constructor(plugin: CommanderPlugin, pairArray: CommandIconPair[]) {
		this.plugin = plugin;
		this.pairs = pairArray;
	}

	public abstract addCommand(pair: CommandIconPair): Promise<void> | void;

	public abstract removeCommand(pair: CommandIconPair): Promise<void> | void;

	public abstract reorder(): Promise<void> | void;
}
