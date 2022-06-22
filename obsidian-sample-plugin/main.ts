import {
	App,
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";

// 记得重命名这些类和接口

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: "default",
};

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		// 在左侧创建一个图标
		const ribbonIconEl = this.addRibbonIcon(
			"dice",
			"Sample Plugin",
			(evt: MouseEvent) => {
				// 当用户单击图标时调用。
				new Notice("This is a notice!");
			}
		);
		// 使用ribbon执行其他操作
		ribbonIconEl.addClass("my-plugin-ribbon-class");

		// 这会将状态栏项目添加到应用程序的底部。不适用于移动应用程序。
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText("Status Bar Text");

		// 这添加了一个可以在任何位置触发的简单命令
		this.addCommand({
			id: "open-sample-modal-simple",
			name: "Open sample modal (simple)",
			callback: () => {
				new SampleModal(this.app).open();
			},
		});
		//这将添加一个编辑器命令，该命令可以在当前编辑器实例上执行某些操作
		this.addCommand({
			id: "sample-editor-command",
			name: "Sample editor command",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection("Sample Editor Command");
			},
		});
		// 这添加了一个复杂的命令，可以检查应用程序的当前状态是否允许执行该命令
		this.addCommand({
			id: "open-sample-modal-complex",
			name: "Open sample modal (complex)",
			checkCallback: (checking: boolean) => {
				// 要检查的条件
				const markdownView =
					this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// 如果检查为true，那么我们只是“检查”命令是否可以运行
					// 如果检查为false，那么我们希望实际执行该操作。
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// 仅当check函数返回true时，此命令才会显示在命令选项板中
					return true;
				}
			},
		});

		// 这将添加一个设置选项卡，以便用户可以配置插件的各个方面
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// 如果插件连接了任何全局DOM事件（应用程序中不属于此插件的部分）
		// 禁用此插件时，使用此函数将自动删除事件侦听器。
		this.registerDomEvent(document, "click", (evt: MouseEvent) => {
			console.log("click", evt);
		});

		// 注册间隔时，此功能将在插件被禁用时自动清除间隔。
		this.registerInterval(
			window.setInterval(() => console.log("setInterval"), 5 * 60 * 1000)
		);
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText("Woah!");
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
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

		containerEl.createEl("h2", { text: "Settings for my awesome plugin." });

		new Setting(containerEl)
			.setName("Setting #1")
			.setDesc("It's a secret")
			.addText((text) =>
				text
					.setPlaceholder("Enter your secret")
					.setValue(this.plugin.settings.mySetting)
					.onChange(async (value) => {
						console.log("Secret: " + value);
						this.plugin.settings.mySetting = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
