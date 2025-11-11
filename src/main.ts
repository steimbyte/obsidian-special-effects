import { MarkdownView, Plugin } from "obsidian";
import {
  DEFAULT_SETTINGS,
  EFFECT_PRESETS,
  SpecialEffectsSettings,
  mergePreset,
} from "./settings";
import { OverlayManager } from "./overlay/overlay-manager";
import { SpecialEffectsSettingTab } from "./settings-tab";

export default class SpecialEffectsPlugin extends Plugin {
  settings: SpecialEffectsSettings = DEFAULT_SETTINGS;

  private overlayManager: OverlayManager | null = null;
  private runtimeEnabledOverride: boolean | null = null;
  private statusBarEl: HTMLElement | null = null;
  private statusUpdateIntervalId: number | null = null;
  private windowBlurred = false;

  async onload(): Promise<void> {
    await this.loadSettings();

    this.overlayManager = new OverlayManager(this.app, () =>
      this.getEffectiveSettings(),
    );
    this.overlayManager.refreshAll();

    this.registerWorkspaceEvents();
    this.registerDomListeners();
    this.registerCommands();

    this.addSettingTab(new SpecialEffectsSettingTab(this.app, this));

    this.statusBarEl = this.addStatusBarItem();
    this.statusBarEl.setText("FX: initializing");
    this.startStatusBarUpdates();

    // Initial activation to apply settings to overlays
    this.overlayManager.setActiveLeaf(this.app.workspace.activeLeaf ?? null);
    this.refreshOverlays();
  }

  onunload(): void {
    if (this.overlayManager) {
      this.overlayManager.dispose();
      this.overlayManager = null;
    }
    if (this.statusUpdateIntervalId) {
      window.clearInterval(this.statusUpdateIntervalId);
      this.statusUpdateIntervalId = null;
    }
  }

  async loadSettings(): Promise<void> {
    const stored = await this.loadData();
    this.settings = {
      ...DEFAULT_SETTINGS,
      ...(stored ?? {}),
    };
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
    this.refreshOverlays();
  }

  getEffectiveSettings(): SpecialEffectsSettings {
    const base = this.settings;
    const runtimeEnabled =
      this.runtimeEnabledOverride !== false && base.enabled;
    return {
      ...base,
      enabled: runtimeEnabled,
    };
  }

  async applyPreset(presetKey: keyof typeof EFFECT_PRESETS): Promise<void> {
    this.settings = mergePreset(this.settings, presetKey);
    await this.saveSettings();
  }

  async toggleEnabled(): Promise<void> {
    this.settings.enabled = !this.settings.enabled;
    this.runtimeEnabledOverride = null;
    await this.saveSettings();
  }

  private registerCommands(): void {
    this.addCommand({
      id: "toggle-special-effects",
      name: "Toggle Special Effects",
      callback: () => {
        void this.toggleEnabled();
      },
    });

    this.addCommand({
      id: "apply-next-effect-preset",
      name: "Apply Next Effect Preset",
      callback: () => {
        const keys = Object.keys(EFFECT_PRESETS);
        const currentIndex = Math.max(
          0,
          keys.indexOf(this.settings.preset),
        );
        const nextKey = keys[(currentIndex + 1) % keys.length] as keyof typeof EFFECT_PRESETS;
        void this.applyPreset(nextKey);
      },
    });
  }

  private registerWorkspaceEvents(): void {
    this.registerEvent(
      this.app.workspace.on("layout-change", () => {
        this.overlayManager?.refreshAll();
        this.overlayManager?.setActiveLeaf(
          this.app.workspace.activeLeaf ?? null,
        );
      }),
    );

    this.registerEvent(
      this.app.workspace.on("active-leaf-change", (leaf) => {
        this.overlayManager?.setActiveLeaf(leaf ?? null);
      }),
    );
  }

  private registerDomListeners(): void {
    this.registerDomEvent(window, "blur", () => {
      this.windowBlurred = true;
      if (this.settings.autoPauseOnBlur) {
        this.setRuntimeEnabledOverride(false);
      }
    });

    this.registerDomEvent(window, "focus", () => {
      this.windowBlurred = false;
      if (this.settings.autoPauseOnBlur) {
        this.setRuntimeEnabledOverride(null);
      }
    });

    this.registerDomEvent(document, "visibilitychange", () => {
      if (document.hidden) {
        this.windowBlurred = true;
        if (this.settings.autoPauseOnBlur) {
          this.setRuntimeEnabledOverride(false);
        }
      } else {
        this.windowBlurred = false;
        if (this.settings.autoPauseOnBlur) {
          this.setRuntimeEnabledOverride(null);
        }
      }
    });
  }

  private setRuntimeEnabledOverride(enabled: boolean | null): void {
    if (this.runtimeEnabledOverride === enabled) return;
    this.runtimeEnabledOverride = enabled;
    this.refreshOverlays();
  }

  private refreshOverlays(): void {
    if (!this.overlayManager) return;
    this.overlayManager.updateSettings(this.getEffectiveSettings());
    this.updateStatusBar();
  }

  private startStatusBarUpdates(): void {
    if (this.statusUpdateIntervalId) {
      window.clearInterval(this.statusUpdateIntervalId);
    }
    this.statusUpdateIntervalId = window.setInterval(
      () => this.updateStatusBar(),
      1500,
    );
    this.registerInterval(this.statusUpdateIntervalId);
  }

  private updateStatusBar(): void {
    if (!this.statusBarEl) return;
    const effective = this.getEffectiveSettings();
    if (!effective.enabled) {
      this.statusBarEl.setText(
        this.settings.enabled
          ? "FX: paused"
          : "FX: disabled",
      );
      return;
    }

    // Get metrics from global overlay
    const globalOverlay = this.overlayManager?.getGlobalOverlay();
    const metrics = globalOverlay?.getMetrics();

    if (metrics) {
      this.statusBarEl.setText(
        `FX: ${metrics.fps}fps · ${metrics.frameTime}ms`,
      );
    } else {
      this.statusBarEl.setText("FX: running");
    }
  }
}

