[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/steimerbyte)

> ⭐ If you find this useful, consider [supporting me on Ko-fi](https://ko-fi.com/steimerbyte)!

<img src="https://storage.ko-fi.com/cdn/generated/fhfuc7slzawvi/2026-04-23_rest-162bec27f642a562eb8401eb0ceb3940-onjpojl8.jpg" alt="steimerbyte" style="border-radius: 5%; margin: 16px 0; max-width: 100%;"/>

# Obsidian Special Effects Renderer

A shader-based visual effects plugin for Obsidian that projects lens flare, bloom, glare, glitter, and glow effects over the entire UI.

![Obsidian Special Effects](https://img.shields.io/badge/Obsidian-Plugin-orange?style=flat-square)
![Version](https://img.shields.io/badge/version-0.0.1-blue?style=flat-square)
![License](https://img.shields.io/badge/license-Apache%202.0-green?style=flat-square)

## Features

- **Shader-Based Effects**: Real-time WebGL rendering of visual effects
- **Global UI Coverage**: Effects render across the entire Obsidian interface, not just the editor
- **Cursor Tracking**: Effects follow your mouse cursor and keyboard input
- **Multiple Effect Types**:
  - **Bloom**: Soft glow around bright areas
  - **Lens Flare**: Cinematic streaks and halos
  - **Glitter**: Sparkling particle effects
  - **Glow Pulse**: Animated breathing effect
- **Performance Optimized**: Configurable quality presets and automatic pause when window loses focus
- **Customizable**: Extensive settings for fine-tuning each effect

## Installation

### Manual Installation

1. Download the latest release from the [Releases](https://github.com/alephtex/obsidian-special-effects/releases) page
2. Extract the files to your vault's `.obsidian/plugins/obsidian-special-effects/` folder
3. Ensure the folder contains:
   - `main.js`
   - `manifest.json`
   - `styles.css`
4. Reload Obsidian or restart the app
5. Enable the plugin in Settings → Community plugins

### Development Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/alephtex/obsidian-special-effects.git
   cd obsidian-special-effects
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the plugin:
   ```bash
   npm run build
   ```

4. Copy the built files to your vault's plugin folder:
   ```bash
   cp main.js manifest.json styles.css [your-vault]/.obsidian/plugins/obsidian-special-effects/
   ```

## Usage

### Basic Usage

1. Open Obsidian Settings → Community plugins
2. Find "Special Effects Renderer" and enable it
3. The effects will start rendering immediately

### Configuration

Access settings via **Settings → Special Effects Renderer**:

- **Enable effects**: Master toggle for all effects
- **Auto pause when unfocused**: Automatically pause rendering when Obsidian loses focus
- **Quality**: Choose between Ultra, High, Medium, or Low quality presets
- **Global intensity**: Overall strength multiplier for all effects
- **Bloom strength**: Controls how strongly bright areas bleed into bloom
- **Lens flare strength**: Intensity of streaks and halos
- **Glitter density**: Amount of sparkles in bright regions
- **Glow pulse animation**: Enable animated breathing effect
- **Follow cursor**: Anchor glow effects to mouse/cursor position

### Presets

The plugin includes three curated presets:

- **Studio Lens**: Balanced bloom and flare for a cinematic feel
- **Minimal Glow**: Soft bloom with subtle glow, gentle on performance
- **Cyber Glitter**: High-energy sparkle and fast pulses for futuristic vibes

### Commands

- **Toggle Special Effects**: Quickly enable/disable effects
- **Apply Next Effect Preset**: Cycle through available presets

## Performance

The plugin is designed to be performant:

- **Adaptive Quality**: Lower quality settings reduce shader complexity
- **Auto-Pause**: Automatically pauses when Obsidian loses focus (optional)
- **Efficient Rendering**: Uses WebGL for hardware-accelerated rendering
- **Status Bar Metrics**: Monitor FPS and frame time in the status bar

## Requirements

- Obsidian v1.5.0 or higher
- WebGL-capable graphics card (most modern systems)

## Development

### Project Structure

```
obsidian-special-effects/
├── src/
│   ├── main.ts                 # Plugin entry point
│   ├── settings.ts             # Settings and presets
│   ├── settings-tab.ts         # Settings UI
│   └── overlay/
│       ├── effect-renderer.ts  # WebGL shader renderer
│       ├── editor-overlay.ts   # Editor-specific overlay
│       ├── global-overlay.ts   # Global UI overlay
│       └── overlay-manager.ts  # Overlay lifecycle management
├── styles.css                  # Plugin styles
├── manifest.json               # Plugin manifest
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
└── esbuild.config.mjs          # Build configuration
```

### Building

```bash
npm run build
```

### Watch Mode

```bash
npm run build -- --watch
```

### TypeScript

The project uses TypeScript for type safety. Configuration is in `tsconfig.json`.

## Troubleshooting

### Effects not showing

1. Check that the plugin is enabled in Settings → Community plugins
2. Verify WebGL is available (check browser console for errors)
3. Try adjusting the quality setting to "Low"
4. Ensure "Enable effects" is turned on in plugin settings

### Performance issues

1. Lower the quality setting
2. Reduce effect intensity
3. Disable "Follow cursor" if not needed
4. Enable "Auto pause when unfocused"

### Effects appear inverted

This was a known issue in earlier versions. Update to the latest version to fix.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the Apache License 2.0 - see the LICENSE file for details.

## Acknowledgments

- Built with [Obsidian Plugin API](https://github.com/obsidianmd/obsidian-api)
- Uses WebGL for hardware-accelerated rendering
- Inspired by cinematic post-processing effects

## Author

**Benjamin Steimer**

- GitHub: [@alephtex](https://github.com/alephtex)

## Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/alephtex/obsidian-special-effects/issues) page
2. Create a new issue with details about your problem
3. Include Obsidian version and system information

---

Made with ❤️ for the Obsidian community
