export type QualityPreset = "ultra" | "high" | "medium" | "low";

export interface SpecialEffectsSettings {
  enabled: boolean;
  quality: QualityPreset;
  intensity: number; // Global multiplier 0..1
  bloomStrength: number;
  flareStrength: number;
  glitterDensity: number;
  glowPulse: boolean;
  followCursor: boolean;
  autoPauseOnBlur: boolean;
  preset: keyof typeof EFFECT_PRESETS;
}

export interface EffectPresetConfig {
  label: string;
  description: string;
  values: Partial<SpecialEffectsSettings>;
}

export const EFFECT_PRESETS: Record<string, EffectPresetConfig> = {
  studio: {
    label: "Studio Lens",
    description: "Balanced bloom and flare for a cinematic feel.",
    values: {
      intensity: 0.75,
      bloomStrength: 0.8,
      flareStrength: 0.6,
      glitterDensity: 0.3,
      glowPulse: true,
      followCursor: true,
      quality: "high",
    },
  },
  minimal: {
    label: "Minimal Glow",
    description: "Soft bloom with subtle glow, gentle on performance.",
    values: {
      intensity: 0.45,
      bloomStrength: 0.4,
      flareStrength: 0.2,
      glitterDensity: 0.1,
      glowPulse: false,
      followCursor: false,
      quality: "medium",
    },
  },
  cyber: {
    label: "Cyber Glitter",
    description: "High-energy sparkle and fast pulses for futuristic vibes.",
    values: {
      intensity: 0.95,
      bloomStrength: 0.9,
      flareStrength: 0.85,
      glitterDensity: 0.7,
      glowPulse: true,
      followCursor: true,
      quality: "ultra",
    },
  },
};

export const DEFAULT_SETTINGS: SpecialEffectsSettings = {
  enabled: true,
  quality: "high",
  intensity: 0.7,
  bloomStrength: 0.7,
  flareStrength: 0.5,
  glitterDensity: 0.35,
  glowPulse: true,
  followCursor: true,
  autoPauseOnBlur: true,
  preset: "studio",
};

export function mergePreset(
  base: SpecialEffectsSettings,
  presetKey: keyof typeof EFFECT_PRESETS,
): SpecialEffectsSettings {
  const preset = EFFECT_PRESETS[presetKey];
  if (!preset) return { ...base, preset: base.preset };
  return {
    ...base,
    ...preset.values,
    preset: presetKey,
  };
}

