# Minimal Modal Note App (Tauri) — Design & Plan

> ⚠️ **DEPRECATED**: This document is outdated. A new, updated feature list and roadmap will be published soon. See [README.md](README.md) for current features.

A compact, resume-worthy desktop note-taking app focused on local-first storage, a VS Code-like filesystem tree under a single .cinder directory, Neovim-like modal editing (optional), per-file AES-256-GCM encryption, and flexible export options. Designed to be minimal, fast, privacy-respecting, and highly keyboard-driven.

## Core Features

- Filesystem tree (VS Code-style) rooted at a single top-level .cinder directory; users can create multiple workspace trees under .cinder.
- Notes authored as Markdown content with YAML frontmatter for metadata (id, tags, created, modified).
- GUI editor with a simple visual editing experience plus an optional modal editing mode (Neovim-like) toggled by a shortcut (zenvim or Option+Cmd+V) to enable hjkl, dd, yy, p and other modal motions.
- Notion-like inline formatting helpers and an "option search" dialog to quickly change the current line to heading, subheading, etc.
- Command palette and leader-key system for quick actions (new note, toggle encryption, export, fuzzy-open, fuzzy search).
- Fuzzy file open and global fuzzy search across note contents and YAML metadata.
- Per-file AES-256-GCM encryption/password protection (salt/nonce/auth tag stored with file); key derived from passphrase (Argon2/PBKDF2) with zero-knowledge intent.
- Export single or grouped notes to Markdown, HTML, and PDF (grouped PDF export supported); bundle export to ZIP with optional encryption.
- Lightweight settings (editor font, tab size, default notes dir, keymap customizations), session restore, and simple preferences UI.

## Tech Stack

- Tauri (Rust backend + WebView frontend) for cross-platform native desktop app.
- Frontend: React + vite + typescript
- Editor component: CodeMirror or Monaco configured for modal keymap; optional headless Neovim integration for full fidelity.
- Storage: filesystem (user-selected notes directory), optional SQLite or JSON index for metadata and fast search.
- Crypto: Rust crates (aes-gcm, rand) for AES-256-GCM; key derivation with Argon2 or PBKDF2 for passphrases.
- Exports: commonmark for Markdown->HTML; headless Chromium or wkhtmltopdf for PDF rendering; ZIP via Rust zip crate.

## UX & Keybindings

- Modes: Normal (navigate & commands), Insert (type), Visual (select & operate).
- Normal-mode basics: h/j/k/l, 0/$, gg/G, dd, yy, p, u (undo), Ctrl-r (redo).
- Search: / to enter incremental search; n/N to navigate matches.
- Command-line: :w to save, :q to close, :Export to trigger export dialog.
- Leader (\ by default) + key for quick actions (\n new note, \f fuzzy open, \e toggle encryption).
- Minimal UI chrome: file tree, editor pane, status/command bar, quick-palette overlay.

## Data Model & Privacy

- Note file format: optional YAML frontmatter followed by Markdown/plain text body.
- Metadata index (JSON or SQLite) stores id, path, tags, created_at, modified_at; can be encrypted if user opts in.
- Encrypted file layout: [magic/version][salt/nonce][ciphertext][auth tag]; Rust backend handles encrypt/decrypt and exposes secure commands to frontend.
- Zero-knowledge approach: passphrases never leave device memory; consider in-memory zeroization for keys.

## Export & Interoperability

- Exports:
  - Markdown: raw file copy or aggregated bundle.
  - HTML: CommonMark rendering with optional CSS theme.
  - PDF: print-to-PDF via headless Chrome or backend renderer for accurate layout.
- Bulk export: select folder or tag and export to ZIP; optional encrypt ZIP with password.
- Interop: keep plain-text notes compatible with other editors; expose import/export for common formats.

## Implementation Plan (Milestones)

1. Project scaffold
   - Initialize Tauri project and frontend scaffold (React + Vite + TypeScript).
   - Set up project structure, linting, and CI metadata.

2. File I/O & Note Model
   - Implement file-per-note read/write and YAML frontmatter parsing.
   - Build a simple file tree UI and note creation/rename/delete flows.

3. Editor & Modal Keymap
   - Integrate CodeMirror/Monaco and implement modal layer for Normal/Insert/Visual modes.
   - Wire keybindings (hjkl, gg, dd, yy, p, /, :) and command palette.

4. Encryption APIs
   - Implement Rust-side AES-256-GCM encryption/decryption with safe key derivation.
   - Expose Tauri commands to encrypt/decrypt files and toggle per-file encryption.

5. Search, Tags & Index
   - Implement simple metadata index (SQLite or JSON) and full-text search across notes.
   - Add tagging UI and tag-based filtering.

6. Export & Packaging
   - Add Markdown->HTML and PDF export, plus ZIP bundling with optional encryption.
   - Configure CI to build Tauri bundles for macOS/Windows/Linux.

7. Polish & Tests
   - Implement settings, session restore, small usability polish, and accessibility checks.
   - Add unit/integration tests for core logic (encryption, file I/O) and end-to-end tests for UI flows.

## Optional Enhancements (Future)

- Sync backend (end-to-end encrypted) or plugin system for extensions.
- True Neovim integration (embed headless Neovim) for complete compatibility.
- Per-note versioning & local history.
- Live collaboration with conflict-free replicated data types (CRDTs) and E2E encryption.

---

If you want this written to a different filename, or want a shorter/longer variant, say the filename or preferences and the file will be adjusted.