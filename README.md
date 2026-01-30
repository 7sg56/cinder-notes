<h4 align="right">English </h4>

<p align="center">
  <!-- LOGO PLACEHOLDER -->
  <a href="#" target="_blank"><img src="https://github.com/7sg56/cinder-notes/blob/main/src-tauri/icons/128x128.png" width="138" alt="Cinder Notes Logo" /></a>
  <h1 align="center">Cinder Notes</h1>
  <div align="center">
    <!-- BADGES PLACEHOLDERS -->
    <a href="#" target="_blank">
      <img alt="License" src="https://img.shields.io/badge/license-MIT-blue?style=flat-square"></a>
    <a href="#" target="_blank">
      <img alt="Tauri" src="https://img.shields.io/badge/built%20with-Tauri-orange?style=flat-square&logo=tauri"></a>
    <a href="#" target="_blank">
      <img alt="React" src="https://img.shields.io/badge/frontend-React-61DAFB?style=flat-square&logo=react"></a>
    <a href="#" target="_blank">
      <img alt="Rust" src="https://img.shields.io/badge/backend-Rust-black?style=flat-square&logo=rust"></a>
  </div>
  <div align="center">The editor for what's next. Minimal, distraction-free, and blazing fast.</div>
</p>

<!-- DEMO VIDEO/GIF PLACEHOLDER -->
<p align="center">
    <img src="https://placehold.co/900x500/1a1a1a/orange?text=Demo+Video+Placeholder" width="900px" alt="Cinder Notes Demo" />
</p>

## Features

- **Zed-Inspired Welcome**: A clean, keyboard-centric welcome page to jumpstart your workflow.
- **Instant Creation**: Create files instantly (`untitled.md`) and rename them inline with a double-click.
- **Split Editor**: Write in Markdown and see the preview in real-time.
- **Beautiful UI**: Dark mode, minimalist design, and smooth animations.
- **Fast**: Built with [Tauri](https://tauri.app/), combining the performance of Rust with the flexibility of the web.

## Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/cinder-notes.git
   cd cinder-notes
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run Development Mode**:
   ```bash
   npm run tauri:dev
   ```
   This will launch the application in a native window.

4. **Build for Production**:
   ```bash
   npm run tauri:build
   ```

## Workflow

### Welcome Page
<img src="https://placehold.co/800x450/1a1a1a/orange?text=Welcome+Page+Screenshot" width="100%" alt="Welcome Page" />

The app opens to a sleek "Welcome" tab.
- **New File**: `Ctrl+N`
- **Open Project**: `Ctrl+O`
- **Command Palette**: `Ctrl+Shift+P`

### File Management
- **Create**: Click the `+` icon or use shortcuts. A generic `untitled.md` is created immediately.
- **Rename**: Double-click any file in the explorer to rename it inline.
- **Organization**: Folders frame your content (implementation in progress).

### Editor
- **Split View**: Markdown on the left, rendered HTML on the right.
- **Distraction Free**: Collapse the file explorer to focus on your writing.

## Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS, Zustand (State Management)
- **Backend**: Rust (Tauri)
- **Icons**: [Lucide React](https://lucide.dev)

## Customization

You can customize the editor theme by modifying `src/index.css` or `src/App.css`. Cinder uses CSS variables for effortless theming.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License.
