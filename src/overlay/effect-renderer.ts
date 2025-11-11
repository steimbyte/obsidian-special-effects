import type { SpecialEffectsSettings } from "../settings";

export interface RendererMetrics {
  fps: number;
  frameTime: number;
  droppedFrames: number;
}

interface UniformLocations {
  time: WebGLUniformLocation | null;
  intensity: WebGLUniformLocation | null;
  resolution: WebGLUniformLocation | null;
  bloom: WebGLUniformLocation | null;
  flare: WebGLUniformLocation | null;
  glitter: WebGLUniformLocation | null;
  glowPulse: WebGLUniformLocation | null;
  cursor: WebGLUniformLocation | null;
}

const VERTEX_SOURCE = `
attribute vec2 a_position;
varying vec2 vUv;

void main() {
  vUv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SOURCE = `
precision highp float;

varying vec2 vUv;

uniform float u_time;
uniform float u_intensity;
uniform vec2 u_resolution;
uniform float u_bloom;
uniform float u_flare;
uniform float u_glitter;
uniform float u_glowPulse;
uniform vec2 u_cursor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 uv) {
  vec2 i = floor(uv);
  vec2 f = fract(uv);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
  vec2 uv = vUv;
  vec2 centered = (uv - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);
  float dist = length(centered);

  float bloom = smoothstep(0.6, 0.0, dist) * u_bloom;
  float flare = abs(sin((centered.x * 8.0) + u_time)) * u_flare * (1.0 - dist);

  float glitter = noise((uv + u_time * 0.15) * (6.0 + u_glitter * 12.0));
  glitter = pow(glitter, mix(3.0, 1.2, u_glitter));

  // Calculate distance from current pixel to cursor position
  vec2 cursorDir = uv - u_cursor;
  float cursorDist = length(cursorDir);
  // Create glow effect that follows the cursor (closer = brighter)
  float cursorGlow = exp(-cursorDist * 12.0) * u_glowPulse;

  float pulse = sin(u_time * 1.6) * 0.5 + 0.5;
  float glow = mix(bloom, bloom * pulse, u_glowPulse);

  float colorIntensity = (glow + flare + glitter * 0.55 + cursorGlow) * u_intensity;
  vec3 baseColor = vec3(
    smoothstep(0.0, 1.2, colorIntensity) * (0.6 + 0.4 * sin(u_time * 0.9)),
    smoothstep(0.0, 2.0, colorIntensity) * (0.5 + 0.5 * sin(u_time * 0.7 + 1.2)),
    smoothstep(0.0, 1.5, colorIntensity) * (0.4 + 0.6 * sin(u_time * 1.1 + 2.5))
  );

  vec3 finalColor = baseColor;
  float alpha = clamp(colorIntensity, 0.0, 1.0);

  gl_FragColor = vec4(finalColor, alpha);
}
`;

export class EffectRenderer {
  private gl: WebGLRenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private buffer: WebGLBuffer | null = null;
  private uniforms: UniformLocations | null = null;
  private animationFrame: number | null = null;
  private startMs = performance.now();
  private lastFrameMs = this.startMs;
  private droppedFrames = 0;
  private metrics: RendererMetrics = { fps: 0, frameTime: 0, droppedFrames: 0 };
  private devicePixelRatio = window.devicePixelRatio ?? 1;

  private cursorPosition: { x: number; y: number } = { x: 0.5, y: 0.5 };

  constructor(
    readonly canvas: HTMLCanvasElement,
    private settings: SpecialEffectsSettings,
  ) {}

  initialize(): void {
    this.canvas.classList.add("fx-overlay-canvas");
    this.setupContext();
    this.setupGeometry();
    this.startLoop();
  }

  updateSettings(settings: SpecialEffectsSettings): void {
    this.settings = settings;
    if (!settings.enabled) {
      this.canvas.classList.add("is-hidden");
      this.stopLoop();
    } else {
      this.canvas.classList.remove("is-hidden");
      if (!this.animationFrame) {
        this.startLoop();
      }
    }
  }

  resize(width: number, height: number): void {
    const dpr = window.devicePixelRatio ?? 1;
    if (this.canvas.width !== Math.floor(width * dpr) || this.canvas.height !== Math.floor(height * dpr)) {
      this.canvas.width = Math.max(1, Math.floor(width * dpr));
      this.canvas.height = Math.max(1, Math.floor(height * dpr));
      this.canvas.style.width = `${Math.round(width)}px`;
      this.canvas.style.height = `${Math.round(height)}px`;
      this.devicePixelRatio = dpr;
    }
    if (this.gl) {
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  setCursorPosition(x: number, y: number): void {
    // Normalize to 0-1 range and invert Y for WebGL coordinate system
    this.cursorPosition.x = Math.max(0, Math.min(1, x));
    this.cursorPosition.y = Math.max(0, Math.min(1, 1.0 - y)); // Invert Y axis
  }

  getMetrics(): RendererMetrics {
    return { ...this.metrics };
  }

  destroy(): void {
    this.stopLoop();
    if (this.gl && this.program) {
      this.gl.deleteProgram(this.program);
    }
    if (this.gl && this.buffer) {
      this.gl.deleteBuffer(this.buffer);
    }
    this.program = null;
    this.buffer = null;
    this.uniforms = null;
    this.gl = null;
  }

  private setupContext(): void {
    const gl =
      (this.canvas.getContext("webgl2", {
        antialias: false,
        premultipliedAlpha: false,
      }) as WebGL2RenderingContext | null) ??
      this.canvas.getContext("webgl", {
        antialias: false,
        premultipliedAlpha: false,
      });

    if (!gl) {
      console.warn("Special Effects Renderer: WebGL not available.");
      return;
    }

    this.gl = gl;
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    const program = this.createProgram(gl, VERTEX_SOURCE, FRAGMENT_SOURCE);
    if (!program) {
      console.error("Special Effects Renderer: Failed to create shader program.");
      return;
    }

    this.program = program;
    gl.useProgram(program);
    this.uniforms = {
      time: gl.getUniformLocation(program, "u_time"),
      intensity: gl.getUniformLocation(program, "u_intensity"),
      resolution: gl.getUniformLocation(program, "u_resolution"),
      bloom: gl.getUniformLocation(program, "u_bloom"),
      flare: gl.getUniformLocation(program, "u_flare"),
      glitter: gl.getUniformLocation(program, "u_glitter"),
      glowPulse: gl.getUniformLocation(program, "u_glowPulse"),
      cursor: gl.getUniformLocation(program, "u_cursor"),
    };
  }

  private setupGeometry(): void {
    if (!this.gl || !this.program) return;
    const gl = this.gl;

    const buffer = gl.createBuffer();
    if (!buffer) return;
    this.buffer = buffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    const vertices = new Float32Array([-1, -1, 3, -1, -1, 3]);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionLoc = gl.getAttribLocation(this.program, "a_position");
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
  }

  private startLoop(): void {
    if (!this.gl || !this.program) return;
    const render = (timeMs: number) => {
      this.animationFrame = requestAnimationFrame(render);
      if (!this.gl || !this.program) return;
      if (!this.settings.enabled) return;

      const delta = timeMs - this.lastFrameMs;
      this.lastFrameMs = timeMs;
      const frameTime = delta;
      const fps = frameTime > 0 ? 1000 / frameTime : 0;
      if (fps < 20) {
        this.droppedFrames += 1;
      }
      this.metrics = {
        fps: Math.round(fps),
        frameTime: Math.round(frameTime),
        droppedFrames: this.droppedFrames,
      };

      this.renderFrame(timeMs);
    };

    this.animationFrame = requestAnimationFrame(render);
  }

  private stopLoop(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  private renderFrame(timeMs: number): void {
    if (!this.gl || !this.program || !this.uniforms) return;
    const gl = this.gl;

    gl.useProgram(this.program);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform1f(this.uniforms.time, (timeMs - this.startMs) / 1000);
    gl.uniform1f(this.uniforms.intensity, this.settings.intensity);
    gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
    gl.uniform1f(this.uniforms.bloom, this.settings.bloomStrength);
    gl.uniform1f(this.uniforms.flare, this.settings.flareStrength);
    gl.uniform1f(this.uniforms.glitter, this.settings.glitterDensity);
    gl.uniform1f(this.uniforms.glowPulse, this.settings.glowPulse ? 1 : 0);
    gl.uniform2f(
      this.uniforms.cursor,
      this.cursorPosition.x,
      this.cursorPosition.y,
    );

    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  private createProgram(
    gl: WebGLRenderingContext,
    vertexSrc: string,
    fragmentSrc: string,
  ): WebGLProgram | null {
    const vertexShader = this.compileShader(gl, gl.VERTEX_SHADER, vertexSrc);
    const fragmentShader = this.compileShader(
      gl,
      gl.FRAGMENT_SHADER,
      fragmentSrc,
    );
    if (!vertexShader || !fragmentShader) {
      if (vertexShader) gl.deleteShader(vertexShader);
      if (fragmentShader) gl.deleteShader(fragmentShader);
      return null;
    }

    const program = gl.createProgram();
    if (!program) return null;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(
        "Special Effects Renderer: Program link error:",
        gl.getProgramInfoLog(program),
      );
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      return null;
    }

    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return program;
  }

  private compileShader(
    gl: WebGLRenderingContext,
    type: number,
    source: string,
  ): WebGLShader | null {
    const shader = gl.createShader(type);
    if (!shader) return null;

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(
        "Special Effects Renderer: Shader compile error:",
        gl.getShaderInfoLog(shader),
      );
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }
}

