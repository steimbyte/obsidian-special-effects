import type { MarkdownView } from "obsidian";
import type { SpecialEffectsSettings } from "../settings";
import { EffectRenderer } from "./effect-renderer";

function ensureRelativePosition(container: HTMLElement) {
  const style = window.getComputedStyle(container);
  if (style.position === "static" || !style.position) {
    container.style.position = "relative";
  }
}

export class EditorOverlay {
  private canvas: HTMLCanvasElement | null = null;
  private renderer: EffectRenderer | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private isActive = false;
  private container: HTMLElement | null = null;
  private lastSettings: SpecialEffectsSettings;
  private updateCursorInterval: number | null = null;

  constructor(
    readonly view: MarkdownView,
    initialSettings: SpecialEffectsSettings,
  ) {
    this.lastSettings = initialSettings;
  }

  mount(): void {
    if (this.canvas) return;

    const cm = (this.view.editor as any)?.cm as
      | {
          dom: HTMLElement;
          scrollDOM: HTMLElement;
          state: {
            selection: {
              main: {
                head: number;
              };
            };
          };
          view: {
            coordsAtPos: (pos: number) => { top: number; left: number } | null;
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

    const container =
      cm?.scrollDOM ??
      this.view.contentEl.querySelector<HTMLElement>(".cm-scroller") ??
      this.view.contentEl;

    if (!container) {
      console.warn("Special Effects Renderer: Could not resolve editor container.");
      return;
    }

    ensureRelativePosition(container);
    this.container = container;

    const canvas = document.createElement("canvas");
    canvas.classList.add("fx-overlay-canvas");
    container.appendChild(canvas);
    this.canvas = canvas;

    this.renderer = new EffectRenderer(canvas, this.lastSettings);
    this.renderer.initialize();
    this.renderer.resize(container.clientWidth, container.clientHeight);

    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === container) {
          const box = entry.contentBoxSize?.[0];
          if (box) {
            this.renderer?.resize(box.inlineSize, box.blockSize);
          } else if (entry.contentRect) {
            this.renderer?.resize(
              entry.contentRect.width,
              entry.contentRect.height,
            );
          }
        }
      }
    });
    this.resizeObserver.observe(container);

    // Track mouse position
    container.addEventListener("mousemove", this.handlePointerMove, {
      passive: true,
    });
    container.addEventListener("mouseleave", this.handlePointerLeave, {
      passive: true,
    });

    // Track keyboard cursor position
    if (cm?.view) {
      const updateCursorPosition = () => {
        if (!this.renderer || !this.container || !this.lastSettings.followCursor) {
          return;
        }
        try {
          const selection = cm.view.state.selection.main;
          const coords = cm.view.coordsAtPos(selection.head);
          if (coords) {
            const rect = container.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
              const x = (coords.left - rect.left) / rect.width;
              const y = (coords.top - rect.top) / rect.height;
              this.renderer.setCursorPosition(x, y);
            }
          }
        } catch (e) {
          // Ignore errors if cursor position can't be determined
        }
      };

      // Update on selection changes (keyboard navigation, clicks)
      const updateInterval = setInterval(updateCursorPosition, 100);
      this.updateCursorInterval = updateInterval;

      // Also update immediately on focus
      container.addEventListener("focus", updateCursorPosition, { passive: true });
    }

    if (!this.lastSettings.enabled) {
      canvas.classList.add("is-hidden");
    }
  }

  unmount(): void {
    if (this.updateCursorInterval) {
      clearInterval(this.updateCursorInterval);
      this.updateCursorInterval = null;
    }

    if (this.container) {
      this.container.removeEventListener("mousemove", this.handlePointerMove);
      this.container.removeEventListener(
        "mouseleave",
        this.handlePointerLeave,
      );
    }

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

  setActive(active: boolean): void {
    this.isActive = active;
    if (this.canvas) {
      this.canvas.style.opacity = active ? "1" : "0";
    }
  }

  updateSettings(settings: SpecialEffectsSettings): void {
    this.lastSettings = settings;
    this.renderer?.updateSettings(settings);
  }

  getMetrics() {
    return this.renderer?.getMetrics();
  }

  private handlePointerMove = (event: MouseEvent) => {
    if (!this.renderer || !this.container || !this.lastSettings.followCursor) {
      return;
    }

    const rect = this.container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    this.renderer.setCursorPosition(x, y);
  };

  private handlePointerLeave = () => {
    if (!this.renderer) return;
    this.renderer.setCursorPosition(0.5, 0.5);
  };
}

