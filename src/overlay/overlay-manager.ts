import type { App, MarkdownView, WorkspaceLeaf } from "obsidian";
import type { SpecialEffectsSettings } from "../settings";
import { EditorOverlay } from "./editor-overlay";
import { GlobalOverlay } from "./global-overlay";

export class OverlayManager {
  private overlayByView = new Map<MarkdownView, EditorOverlay>();
  private globalOverlay: GlobalOverlay | null = null;

  constructor(
    private readonly app: App,
    private getSettings: () => SpecialEffectsSettings,
  ) {}

  refreshAll(): void {
    // Create/update global overlay for entire UI
    if (!this.globalOverlay) {
      this.globalOverlay = new GlobalOverlay(this.app, this.getSettings());
      this.globalOverlay.mount();
    } else {
      this.globalOverlay.updateSettings(this.getSettings());
    }

    // Keep editor overlays for backward compatibility (optional)
    const activeViews = new Set<MarkdownView>();
    this.app.workspace.iterateAllLeaves((leaf) => {
      if (leaf.view instanceof MarkdownView) {
        activeViews.add(leaf.view);
        // Editor overlays are now optional - global overlay handles everything
      }
    });

    // Clean up unused editor overlays
    for (const [view, overlay] of Array.from(this.overlayByView.entries())) {
      if (!activeViews.has(view)) {
        overlay.unmount();
        this.overlayByView.delete(view);
      }
    }
  }

  setActiveLeaf(leaf: WorkspaceLeaf | null): void {
    // Global overlay doesn't need active leaf tracking
    // Keep for backward compatibility
    const activeView =
      leaf && leaf.view instanceof MarkdownView ? leaf.view : null;
    for (const [view, overlay] of this.overlayByView.entries()) {
      overlay.setActive(view === activeView);
    }
  }

  updateSettings(settings: SpecialEffectsSettings): void {
    this.globalOverlay?.updateSettings(settings);
    for (const overlay of this.overlayByView.values()) {
      overlay.updateSettings(settings);
    }
  }

  dispose(): void {
    if (this.globalOverlay) {
      this.globalOverlay.unmount();
      this.globalOverlay = null;
    }
    for (const overlay of this.overlayByView.values()) {
      overlay.unmount();
    }
    this.overlayByView.clear();
  }

  getOverlay(view: MarkdownView): EditorOverlay | undefined {
    return this.overlayByView.get(view);
  }

  getGlobalOverlay(): GlobalOverlay | null {
    return this.globalOverlay;
  }
}
