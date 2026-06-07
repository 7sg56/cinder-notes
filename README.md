<p align="center">
  <a href="https://github.com/7sg56/cinder-notes"><img src="public/app-icon.png" width="80" alt="Cinder Notes" /></a>
  <h1 align="center">Cinder Notes</h1>
  <div align="center">
    <img alt="Version" src="https://img.shields.io/badge/version-0.2.0--pre.1-orange?style=flat-square">
    <img alt="License" src="https://img.shields.io/badge/license-MIT-blue?style=flat-square">
    <img alt="Tauri" src="https://img.shields.io/badge/Tauri-v2-orange?style=flat-square&logo=tauri">
    <img alt="macOS 12+" src="https://img.shields.io/badge/macOS-12%2B-white?style=flat-square&logo=apple">
    <img alt="Windows 10+" src="https://img.shields.io/badge/Windows-10%2B-blue?style=flat-square&logo=windows">
  </div>
  <div align="center"><em>Minimal. Local-first. Blazing fast.</em></div>
</p>

<p align="center">
  <img src="public/Application.png" width="1000" alt="Cinder Notes" />
</p>

---

## Download

Download the latest release for your platform.

| Platform | Download | Notes |
| --- | --- | --- |
| macOS (Apple Silicon) | [Cinder-Notes.dmg](https://github.com/7sg56/cinder-notes/releases/latest) | macOS 12+, unsigned (right-click > Open) |
| macOS (Intel) | [Cinder-Notes.dmg](https://github.com/7sg56/cinder-notes/releases/latest) | macOS 12+, unsigned |
| Windows | [Cinder-Notes.msi](https://github.com/7sg56/cinder-notes/releases/latest) | Windows 10+ |

Or build from source -- see [Development](#development) below.

## Features

- **Split-view editor** -- Markdown on the left, live preview on the right
- **Tab management** -- Multiple files, seamless switching
- **File explorer** -- Clean tree view with drag-and-drop
- **Global search** -- Search across all workspace files (Cmd+Shift+F)
- **Three themes** -- Cinder Dark, Cinder Light, Zen Black (OLED)
- **Auto-save** -- Changes saved as you type
- **Rich Markdown** -- GFM, LaTeX math, syntax-highlighted code blocks
- **Native feel** -- macOS vibrancy, overlay title bar, smooth animations
- **Tiny footprint** -- ~15MB bundle vs Electron's ~150MB

## Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| Cmd+S | Force save |
| Cmd+N | New file |
| Cmd+Shift+N | New folder |
| Cmd+W | Close current tab |
| Cmd+B | Toggle sidebar |
| Cmd+Shift+F | Global search |
| Cmd+F | Find/replace (in editor) |

## Development

### Prerequisites

- Node.js 18+
- Rust (latest stable)

### Quick Start

```bash
git clone https://github.com/7sg56/cinder-notes.git
cd cinder-notes
npm install
npm run tauri:dev
```

### Build

```bash
npm run tauri:build
```

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Tauri v2 (Rust) |
| Frontend | React 19, TypeScript |
| Build | Vite |
| Editor | CodeMirror |
| State | Zustand |
| Styling | Tailwind CSS v4 |

## Contributing

See [CONTRIBUTING.md](.github/CONTRIBUTING.md) for guidelines.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for release history.

## License

MIT -- see [LICENSE](LICENSE).

<p align="center">
  <sub>If you find Cinder useful, consider giving it a <a href="https://github.com/7sg56/cinder-notes">star on GitHub</a>.</sub>
</p>
