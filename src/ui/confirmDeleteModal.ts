import { Modal } from "obsidian";
import { h, render } from "preact";
import t from "src/l10n";
import CommanderPlugin from "src/main";
import { confirmDeleteComponent } from "./components/confirmDeleteComponent";

export default class ConfirmDeleteModal extends Modal {
	public remove: boolean;

	public constructor(public plugin: CommanderPlugin) {
		super(plugin.app);
	}

	public async onOpen(): Promise<void> {
		this.titleEl.innerText = t("Remove Command");
		this.containerEl.addClass("cmdr-confirm-delete-modal");
		render(h(confirmDeleteComponent, { modal: this }), this.contentEl);
	}

	public async didChooseRemove(): Promise<boolean> {
		this.open();
		return new Promise((resolve) => {
			this.onClose = (): void => resolve(this.remove ?? false);
		});
	}

	public onClose(): void {
		render(null, this.contentEl);
	}
}
