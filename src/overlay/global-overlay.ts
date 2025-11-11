import type { App, MarkdownView } from "obsidian";
import type { SpecialEffectsSettings } from "../settings";
import { EffectRenderer } from "./effect-renderer";

export class GlobalOverlay {
  private canvas: HTMLCanvasElement | null = null;
  private renderer: EffectRenderer | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private lastSettings: SpecialEffectsSettings;
  private container: HTMLElement | null = null;
  private updateCursorInterval: number | null = null;

  constructor(
    private readonly app: App,
    initialSettings: SpecialEffectsSettings,
  ) {
    this.lastSettings = initialSettings;
  }

  mount(): void {
    if (this.canvas) return;

    // Find the main workspace container
    const workspaceEl = this.app.workspace.containerEl;
    if (!workspaceEl) {
      console.warn("Special Effects Renderer: Could not find workspace container.");
      return;
    }

    // Ensure the workspace container has relative positioning
    const style = window.getComputedStyle(workspaceEl);
    if (style.position === "static" || !style.position) {
      workspaceEl.style.position = "relative";
    }

    this.container = workspaceEl;

    const canvas = document.createElement("canvas");
    canvas.classList.add("fx-overlay-canvas", "fx-global-overlay");
    workspaceEl.appendChild(canvas);
    this.canvas = canvas;

    this.renderer = new EffectRenderer(canvas, this.lastSettings);
    this.renderer.initialize();
    this.renderer.resize(window.innerWidth, window.innerHeight);

    // Track window resize
    this.resizeObserver = new ResizeObserver(() => {
      this.renderer?.resize(window.innerWidth, window.innerHeight);
    });
    this.resizeObserver.observe(document.body);

    // Track mouse position globally
    document.addEventListener("mousemove", this.handlePointerMove, {
      passive: true,
    });

    // Track keyboard cursor position
    this.setupKeyboardTracking();

    if (!this.lastSettings.enabled) {
      canvas.classList.add("is-hidden");
    }
  }

  unmount(): void {
    if (this.updateCursorInterval) {
      clearInterval(this.updateCursorInterval);
      this.updateCursorInterval = null;
    }

    document.removeEventListener("mousemove", this.handlePointerMove);

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (this.renderer) {
      this.renderer.destroy();
      this.renderer = null;
    }

    if (this.canvas?.parentElement) {
      this.canvas.parentElement.removeChild(this.canvas);
    }
    this.canvas = null;
    this.container = null;
  }

  updateSettings(settings: SpecialEffectsSettings): void {
    this.lastSettings = settings;
    this.renderer?.updateSettings(settings);
  }

  getMetrics() {
    return this.renderer?.getMetrics();
  }

  private handlePointerMove = (event: MouseEvent) => {
    if (!this.renderer || !this.lastSettings.followCursor) {
      return;
    }

    const x = event.clientX / window.innerWidth;
    const y = event.clientY / window.innerHeight;
    this.renderer.setCursorPosition(x, y);
  };

  private setupKeyboardTracking(): void {
    const updateCursorPosition = () => {
      if (!this.renderer || !this.lastSettings.followCursor) {
        return;
      }
      try {
        // Try to get cursor position from active editor
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (activeView) {
          const cm = (activeView.editor as any)?.cm as
            | {
                view: {
                  coordsAtPos: (pos: number) => {
                    top: number;
                    left: number;
                  } | null;
                  state: {
                    selection: {
                      main: {
                        head: number;
                      };
                    };
                  };
                };
              }
            | undefined;

          if (cm?.view) {
            const selection = cm.view.state.selection.main;
            const coords = cm.view.coordsAtPos(selection.head);
            if (coords) {
              const x = coords.left / window.innerWidth;
              const y = coords.top / window.innerHeight;
              this.renderer?.setCursorPosition(x, y);
              return;
            }
          }
        }

        // Fallback: use mouse position if available
        // (handled by mousemove event)
      } catch (e) {
        // Ignore errors if cursor position can't be determined
      }
    };

    // Update on selection changes (keyboard navigation, clicks)
    this.updateCursorInterval = window.setInterval(updateCursorPosition, 100);

    // Also update on focus
    document.addEventListener("focus", updateCursorPosition, {
      passive: true,
    });
  }
}

