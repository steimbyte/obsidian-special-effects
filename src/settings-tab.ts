import { PluginSettingTab, Setting } from "obsidian";
import type SpecialEffectsPlugin from "./main";
import { EFFECT_PRESETS } from "./settings";

export class SpecialEffectsSettingTab extends PluginSettingTab {
  constructor(app: SpecialEffectsPlugin["app"], private plugin: SpecialEffectsPlugin) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "Special Effects Renderer" });
    containerEl.createEl("p", {
      text: "Configure shader-based effects that render above the editor.",
    });

    new Setting(containerEl)
      .setName("Enable effects")
      .setDesc("Turn the special effects overlay on or off.")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enabled)
          .onChange(async (value) => {
            this.plugin.settings.enabled = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Auto pause when unfocused")
      .setDesc("Temporarily pause rendering when Obsidian loses focus.")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.autoPauseOnBlur)
          .onChange(async (value) => {
            this.plugin.settings.autoPauseOnBlur = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Quality")
      .setDesc("Trade-off between effect fidelity and performance.")
      .addDropdown((dropdown) => {
        dropdown
          .addOptions({
            ultra: "Ultra",
            high: "High",
            medium: "Medium",
            low: "Low",
          })
          .setValue(this.plugin.settings.quality)
          .onChange(async (value) => {
            this.plugin.settings.quality = value as typeof this.plugin.settings.quality;
            await this.plugin.saveSettings();
          });
      });

    containerEl.createEl("h3", { text: "Effect Tuning" });

    new Setting(containerEl)
      .setName("Global intensity")
      .setDesc("Overall strength applied to all effects.")
      .addSlider((slider) =>
        slider
          .setLimits(0, 1, 0.05)
          .setDynamicTooltip()
          .setValue(this.plugin.settings.intensity)
          .onChange(async (value) => {
            this.plugin.settings.intensity = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Bloom strength")
      .setDesc("Controls how strongly bright areas bleed into bloom.")
      .addSlider((slider) =>
        slider
          .setLimits(0, 1, 0.05)
          .setDynamicTooltip()
          .setValue(this.plugin.settings.bloomStrength)
          .onChange(async (value) => {
            this.plugin.settings.bloomStrength = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Lens flare strength")
      .setDesc("Intensity of the streaks and halo around highlights.")
      .addSlider((slider) =>
        slider
          .setLimits(0, 1, 0.05)
          .setDynamicTooltip()
          .setValue(this.plugin.settings.flareStrength)
          .onChange(async (value) => {
            this.plugin.settings.flareStrength = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Glitter density")
      .setDesc("Amount of sparkles emitted in bright regions.")
      .addSlider((slider) =>
        slider
          .setLimits(0, 1, 0.05)
          .setDynamicTooltip()
          .setValue(this.plugin.settings.glitterDensity)
          .onChange(async (value) => {
            this.plugin.settings.glitterDensity = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Glow pulse animation")
      .setDesc("Animate glow intensity with a soft breathing effect.")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.glowPulse)
          .onChange(async (value) => {
            this.plugin.settings.glowPulse = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Follow cursor")
      .setDesc("Anchor additional glow to the mouse position.")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.followCursor)
          .onChange(async (value) => {
            this.plugin.settings.followCursor = value;
            await this.plugin.saveSettings();
          }),
      );

    containerEl.createEl("h3", { text: "Presets" });

    let selectedPreset = this.plugin.settings.preset;

    const presetSetting = new Setting(containerEl)
      .setName("Choose preset")
      .setDesc("Load a curated configuration for rapid setup.");

    presetSetting.addDropdown((dropdown) => {
      Object.entries(EFFECT_PRESETS).forEach(([key, preset]) => {
        dropdown.addOption(key, preset.label);
      });
      dropdown.setValue(selectedPreset);
      dropdown.onChange((value) => {
        selectedPreset = value as keyof typeof EFFECT_PRESETS;
      });
    });

    presetSetting.addButton((button) =>
      button
        .setButtonText("Apply")
        .setCta()
        .onClick(async () => {
          await this.plugin.applyPreset(selectedPreset);
          this.display();
        }),
    );
  }
}

