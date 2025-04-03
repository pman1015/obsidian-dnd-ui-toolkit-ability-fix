import { AbilityBlock, AbilityModifier, AbilityScores, SavingThrowsBlock, StatsBlock } from 'lib/types';
import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { parse } from 'yaml';
import * as Tmpl from "./lib/html-templates"
import * as Components from "./lib/components"

// Remember to rename these classes and interfaces!
//

function parseAbilityBlock(yamlString: string): AbilityBlock {
	const parsed = parse(yamlString);
	const abilities = parsed.abilities || {};
	const modifiersArray = parsed.modifiers || [];

	const orZero = (value?: number) => {
		if (value === undefined) {
			return 0;
		}

		return value
	}

	const abilityScores: AbilityScores = {
		strength: orZero(abilities.strength),
		dexterity: orZero(abilities.dexterity),
		constitution: orZero(abilities.constitution),
		intelligence: orZero(abilities.intelligence),
		wisdom: orZero(abilities.wisdom),
		charisma: orZero(abilities.charisma),
	};

	// Parse modifiers
	const modifiers: AbilityModifier[] = Array.isArray(modifiersArray)
		? modifiersArray.filter(mod =>
			mod &&
			typeof mod.name === 'string' &&
			typeof mod.target === 'string' &&
			typeof mod.value === 'number' &&
			['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].includes(mod.target)
		)
		: [];

	return {
		abilities: abilityScores,
		modifiers: modifiers
	};
}

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		this.registerMarkdownCodeBlockProcessor("ability", (source, el, ctx) => {
			const div = el.createEl("div");

			const abilityBlock = parseAbilityBlock(source);

			// insert hello world
			const contents = Tmpl.Render(Components.AbilityView(abilityBlock));

			div.innerHTML = contents
		});

		this.registerMarkdownCodeBlockProcessor("stats", (source, el, ctx) => {
			const div = el.createEl("div");

			try {
				const parsed = parse(source);
				const items = Array.isArray(parsed.items) ? parsed.items : [];
				const grid = parsed.grid || {};

				const statsBlock: StatsBlock = {
					items: items.map((item: any) => ({
						name: String(item.name || ''),
						value: item.value !== undefined ? item.value : ''
					})),
					grid: {
						columns: typeof grid.columns === 'number' ? grid.columns : undefined
					}
				};

				const contents = Tmpl.Render(Components.StatsView(statsBlock));
				div.innerHTML = contents;
			} catch (error) {
				div.innerHTML = `<div class="notice">Error parsing stats block: ${error.message}</div>`;
			}
		});

		this.registerMarkdownCodeBlockProcessor("savingthrows", async (source, el, ctx) => {
			const div = el.createEl("div");

			try {
				// Get the current file's metadata and cache
				const activeFile = this.app.workspace.getActiveFile();
				if (!activeFile) {
					throw new Error("No active file");
				}

				const fileCache = this.app.metadataCache.getFileCache(activeFile);
				if (!fileCache) {
					throw new Error("File cache not available");
				}


				// Get frontmatter data
				const frontmatter = fileCache.frontmatter || {};
				const proficiencyBonus = Number(frontmatter["Proficiency Bonus"]) || 2; // Default to 2 if not set
				const savingThrowProficiencies = frontmatter["Profficiencies"] || [];

				// Normalize saving throw proficiencies to lowercase 
				// @ts-ignore
				const proficiencies: Array<keyof AbilityScores> = Array.isArray(savingThrowProficiencies)
					? savingThrowProficiencies
						.map(s => String(s).toLowerCase())
						.filter(s => ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].includes(s))
					: [];

				// Get the first ability block in the file
				let abilityScores: AbilityScores = {
					strength: 10,
					dexterity: 10,
					constitution: 10,
					intelligence: 10,
					wisdom: 10,
					charisma: 10
				};

				// Look for ability codeblock in the file content
				if (fileCache.sections) {
					const abilitySection = fileCache.sections.find(section =>
						section.type === 'code' && section.position &&
						// @ts-ignore
						fileCache.content?.substring(section.position.start.offset, section.position.start.offset + 7) === '```ability');

					if (abilitySection && abilitySection.position) {
						// @ts-ignore
						const content = fileCache.content?.substring(
							abilitySection.position.start.offset + 10, // Skip ```ability
							abilitySection.position.end.offset - 3 // Skip ```
						);

						if (content) {
							const abilityBlock = parseAbilityBlock(content);
							abilityScores = abilityBlock.abilities;
						}
					}
				}

				// Parse custom bonuses from the source
				const parsed = parse(source);
				// @ts-ignore
				const bonuses: Record<keyof AbilityScores, number> = {};

				if (parsed && typeof parsed === 'object' && parsed.bonuses) {
					const keys: Array<keyof AbilityScores> = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
					keys.forEach(key => {
						if (parsed.bonuses[key] !== undefined && !isNaN(Number(parsed.bonuses[key]))) {
							bonuses[key] = Number(parsed.bonuses[key]);
						}
					});
				}

				const savingThrowsBlock: SavingThrowsBlock = {
					proficiencyBonus,
					abilityScores,
					proficiencies,
					bonuses
				};

				const contents = Tmpl.Render(Components.SavingThrowsView(savingThrowsBlock));
				div.innerHTML = contents;
			} catch (error) {
				div.innerHTML = `<div class="notice">Error generating saving throws: ${error.message}</div>`;
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));
	}

	onunload() { }

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
