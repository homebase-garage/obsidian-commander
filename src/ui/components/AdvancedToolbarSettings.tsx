import {
	ExtraButtonComponent,
	Notice,
	Platform,
	setIcon,
	Setting,
	SliderComponent,
} from "obsidian";
import { Fragment, h } from "preact";
import { useEffect, useRef } from "preact/hooks";
import { DEFAULT_SETTINGS } from "src/constants";
import t from "src/l10n";
import CommanderPlugin from "src/main";
import { injectIcons, ObsidianIcon, updateStyles } from "src/util";
import ChooseIconModal from "../chooseIconModal";

function addResettableSlider(
	containerEl: HTMLElement,
	opts: {
		name: string;
		desc: string;
		min: number;
		max: number;
		step: number;
		value: number;
		defaultValue: number;
		onChange: (value: number) => Promise<void>;
	}
): void {
	let resetBtn: ExtraButtonComponent;
	let slider: SliderComponent;
	new Setting(containerEl)
		.setName(opts.name)
		.setDesc(opts.desc)
		.addSlider((cb) => {
			slider = cb;
			cb.setLimits(opts.min, opts.max, opts.step)
				.setValue(opts.value)
				.setDynamicTooltip()
				.onChange(async (value) => {
					await opts.onChange(value);
					resetBtn.setDisabled(value === opts.defaultValue);
				});
		})
		.addExtraButton((bt) => {
			resetBtn = bt;
			bt.setIcon("reset")
				.setTooltip(t("Restore default"))
				.setDisabled(opts.value === opts.defaultValue)
				.onClick(async () => {
					slider.setValue(opts.defaultValue);
					await opts.onChange(opts.defaultValue);
					resetBtn.setDisabled(true);
				});
		});
}

function render(containerEl: HTMLElement, plugin: CommanderPlugin): void {
	containerEl.empty();

	addResettableSlider(containerEl, {
		name: "Toolbar row count",
		desc: "Set how many rows the mobile toolbar should have. Set this to 0 to remove the toolbar.",
		min: 0,
		max: 5,
		step: 1,
		value: plugin.settings.advancedToolbar.rowCount,
		defaultValue: DEFAULT_SETTINGS.advancedToolbar.rowCount,
		onChange: async (value) => {
			plugin.settings.advancedToolbar.rowCount = value;
			await plugin.saveSettings();
			updateStyles(plugin.settings.advancedToolbar);
		},
	});

	new Setting(containerEl)
		.setName("Column layout")
		.setDesc(
			"Use a column based layout instead of the default row. This makes it easier to arrange the commands."
		)
		.addToggle((cb) =>
			cb
				.setValue(plugin.settings.advancedToolbar.columnLayout)
				.onChange(async (value) => {
					plugin.settings.advancedToolbar.columnLayout = value;
					await plugin.saveSettings();
					updateStyles(plugin.settings.advancedToolbar);
				})
		);

	// new Setting(containerEl)
	// 	.setName("Show Tooltips for Quick Actions")
	// 	.setDesc("Show Tooltips over the Quick Actions on hover. This helps to more easily identify Commands. IMPORTANT: Only works with a Stylus/Apple Pen/Mouse")
	// 	.addToggle(cb => {
	// 		cb.setValue(plugin.settings.advancedToolbar.tooltips)
	// 			.onChange(async (value) => {
	// 				plugin.settings.advancedToolbar.tooltips = value;
	// 				await plugin.saveSettings();
	// 			})
	// 	})

	addResettableSlider(containerEl, {
		name: "Bottom offset",
		desc: "Offset the toolbar from the bottom of the screen. This is useful if the toolbar is partially obscured by other UI elements.",
		min: 0,
		max: 32,
		step: 1,
		value: plugin.settings.advancedToolbar.heightOffset,
		defaultValue: DEFAULT_SETTINGS.advancedToolbar.heightOffset,
		onChange: async (value) => {
			plugin.settings.advancedToolbar.heightOffset = value;
			await plugin.saveSettings();
			updateStyles(plugin.settings.advancedToolbar);
		},
	});

	if (Platform.isMobile) {
		const description = createFragment();
		description.appendChild(createEl("h3", { text: "Custom icons" }));
		containerEl.appendChild(description);

		plugin.getCommandsWithoutIcons().forEach((command) => {
			new Setting(containerEl)
				.setName(command.name)
				.setDesc(`ID: ${command.id}`)
				.addButton((bt) => {
					const iconDiv = bt.buttonEl.createDiv({
						cls: "AT-settings-icon",
					});
					if (command.icon) {
						setIcon(iconDiv, command.icon);
					} else {
						const currentIcon =
							plugin.settings.advancedToolbar.mappedIcons.find(
								(m) => m.commandID === command.id
							)?.iconID;
						currentIcon
							? setIcon(iconDiv, currentIcon)
							: bt.setButtonText("No icon");
					}
					bt.onClick(async () => {
						const icon = await new ChooseIconModal(
							plugin
						).awaitSelection();
						const mappedIcon =
							plugin.settings.advancedToolbar.mappedIcons.find(
								(m) => m.commandID === command.id
							);
						if (mappedIcon) {
							mappedIcon.iconID = icon;
						} else {
							plugin.settings.advancedToolbar.mappedIcons.push({
								commandID: command.id,
								iconID: icon,
							});
						}
						await plugin.saveSettings();
						injectIcons(plugin.settings.advancedToolbar, plugin);
						render(containerEl, plugin);
					});
				})
				.addExtraButton((bt) => {
					bt.setIcon("reset")
						.setTooltip("Reset to default - requires a restart")
						.onClick(async () => {
							plugin.settings.advancedToolbar.mappedIcons =
								plugin.settings.advancedToolbar.mappedIcons.filter(
									(p) => p.commandID !== command.id
								);
							delete command.icon;
							delete plugin.app.commands.commands[command.id].icon;
							await plugin.saveSettings();
							render(containerEl, plugin);
							new Notice(
								"If the default icon doesn't appear, you might have to restart Obsidian."
							);
						});
				});
		});
	}

	const advancedEl = containerEl.appendChild(
		createDiv({
			cls: "cmdr-sep-con",
			attr: { style: "margin-top: 64px" },
		})
	);
	advancedEl.appendChild(
		createDiv({
			text: "Advanced settings",
			attr: { style: "margin-bottom: 8px; font-weight: bold" },
		})
	);

	new Setting(advancedEl)
		.setName("Button height")
		.setDesc(
			"Change the height of each button inside the mobile toolbar (in px)."
		)
		.addText((cb) =>
			cb
				.setValue(
					plugin.settings.advancedToolbar.rowHeight?.toString() ??
						"48"
				)
				.setPlaceholder("48")
				.onChange(async (value) => {
					const height = Number(value);
					const invalid = isNaN(height);
					cb.inputEl.toggleClass("is-invalid", invalid);
					if (!invalid) {
						plugin.settings.advancedToolbar.rowHeight = height;
						await plugin.saveSettings();
						updateStyles(plugin.settings.advancedToolbar);
					}
				})
		);
	new Setting(advancedEl)
		.setName("Button width")
		.setDesc(
			"Change the width of each button inside the mobile toolbar (in px)."
		)
		.addText((cb) =>
			cb
				.setValue(
					plugin.settings.advancedToolbar.buttonWidth?.toString() ??
						"48"
				)
				.setPlaceholder("48")
				.onChange(async (value) => {
					const width = Number(value);
					const invalid = isNaN(width);
					cb.inputEl.toggleClass("is-invalid", invalid);
					if (!invalid) {
						plugin.settings.advancedToolbar.buttonWidth = width;
						await plugin.saveSettings();
						updateStyles(plugin.settings.advancedToolbar);
					}
				})
		);
	addResettableSlider(advancedEl, {
		name: "Toolbar extra spacing",
		desc: "Some themes need extra spacing in the toolbar. If your toolbar doesn't wrap properly, try increasing this value.",
		min: 0,
		max: 64,
		step: 1,
		value: plugin.settings.advancedToolbar.spacing,
		defaultValue: DEFAULT_SETTINGS.advancedToolbar.spacing,
		onChange: async (value) => {
			plugin.settings.advancedToolbar.spacing = value;
			await plugin.saveSettings();
			updateStyles(plugin.settings.advancedToolbar);
		},
	});
}

export default function AdvancedToolbarSettings({
	plugin,
}: {
	plugin: CommanderPlugin;
}): h.JSX.Element {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (ref.current) {
			render(ref.current, plugin);
		}
		return (): void => {
			ref.current && ref.current.empty();
		};
	}, []);

	return (
		<Fragment>
			<div className="cmdr-sep-con callout" data-callout="info">
				<span className="cmdr-callout-warning">
					<ObsidianIcon icon="alert-circle" /> {"Info"}
				</span>
				<p className="cmdr-warning-description">
					{"The Toolbar is only available in Obsidian Mobile. "}
					{Platform.isMobile && (
						<>
							{
								"To configure which Commands show up in the Toolbar, open the Mobile Settings."
							}
						</>
					)}
				</p>
				{Platform.isMobile && (
					<button
						onClick={(): void => {
							plugin.app.setting.openTabById("mobile");
						}}
						className="mod-cta"
					>
						{"Open mobile settings"}
					</button>
				)}
			</div>
			<div
				ref={ref}
				className="cmdr-advanced-toolbar-settings"
				style={{ paddingBottom: "128px" }}
			/>
		</Fragment>
	);
}
