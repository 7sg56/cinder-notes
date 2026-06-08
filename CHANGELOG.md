# Changelog

All notable changes to Cinder Notes will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0-pre.1] - 2026-06-07

### Added

- In-app auto-updater via `tauri-plugin-updater` with GitHub Releases endpoint
- GitHub Actions release workflow for macOS (Apple Silicon) and Windows builds
- Proper semantic versioning synced across `package.json`, `tauri.conf.json`, and `Cargo.toml`
- Version sync script (`npm run version:sync`)
- Release tag script (`npm run release:tag`)
- DMG installer configuration for macOS
- This changelog

### Changed

- Product name changed from `cinder-notes` to `Cinder Notes` (display name)
- README completely rewritten -- download links, condensed feature list, removed outdated roadmap
- Cargo package metadata filled in (description, license, repository)
- Old feature logs archived to `docs/archive/`

## [0.1.2] - 2026-04-xx

### Added

- Split-view editor with live Markdown preview
- Tab management with multiple open files
- File explorer with tree view and drag-and-drop
- Global search across workspace files (Cmd+Shift+F)
- In-editor find and replace (Cmd+F)
- Three built-in themes: Cinder Dark, Cinder Light, Zen Black
- Auto-save with Tauri FS APIs
- Rich Markdown rendering (GFM, LaTeX math via KaTeX, syntax-highlighted code blocks)
- Native context menus with keyboard accelerators
- Breadcrumb navigation
- Inline file/folder renaming
- Workspace selection and persistence
- macOS vibrancy and overlay title bar
- Floating hub for quick theme/settings access
- Collapsible sidebar
- Keyboard shortcuts (Cmd+N, Cmd+S, Cmd+W, Cmd+B, Cmd+Shift+F, Cmd+F)

### Fixed

- Confirmation dialogs for destructive file operations
- Unsaved changes indicator on tabs

## [0.1.0] - 2026-02-xx

### Added

- Initial alpha release
- Basic Markdown editor with CodeMirror
- File system operations (create, read, write, delete notes)
- Single theme (Cinder Dark)

[Unreleased]: https://github.com/7sg56/cinder-notes/compare/v0.2.0-pre.1...HEAD
[0.2.0-pre.1]: https://github.com/7sg56/cinder-notes/compare/v0.1.2...v0.2.0-pre.1
[0.1.2]: https://github.com/7sg56/cinder-notes/compare/v0.1.0...v0.1.2
[0.1.0]: https://github.com/7sg56/cinder-notes/releases/tag/v0.1.0
