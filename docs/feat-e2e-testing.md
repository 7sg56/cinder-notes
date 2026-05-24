# feat/e2e-testing

Full testing infrastructure for Cinder-notes across three tiers: Rust backend unit tests, React component tests, and Playwright end-to-end tests.

## Commits

| Hash | Description |
|------|-------------|
| `bd82f51` | test(rust): add comprehensive unit tests for commands, trash, and workspace modules |
| `43730bb` | test(react): add Vitest + React Testing Library component tests |
| `0604fc3` | chore: add data-testid attributes to 7 components for E2E testing |
| `fa87702` | test(e2e): add Playwright E2E test suite with 42 tests across 6 specs |
| `7d89ef6` | ci: add tests.yml workflow for Rust, React, and Playwright tests |
| `fae49ba` | ci: rename workflow files for clarity |

## Stats

- **28 files changed**, 3,029 insertions, 39 deletions
- **109 total tests** (41 Rust + 26 React + 42 Playwright)
- **37 data-testid attributes** added across 7 components

---

## Rust Backend Tests (41 tests)

Unit tests added directly within each module behind `#[cfg(test)]`, using `tempfile` for isolated filesystem testing.

- **commands.rs** (18 tests) -- `read_note`, `write_note`, `create_note`, `rename_note`, `create_folder`, `scan_workspace`, `search_workspace`, `workspace_stats`, `delete_note`, `delete_folder`
- **trash.rs** (12 tests) -- manifest read/write roundtrip, `move_to_trash` (file and folder), `restore_item`, `delete_item`, `empty_all`
- **workspace.rs** (10 tests, 7 new) -- `validate_workspace_path`, nested directory scanning, sort order (folders first, alphabetical within type), hidden directory and non-markdown file exclusion

## React Component Tests (26 tests)

Vitest + React Testing Library + jsdom. Tauri APIs are fully mocked in a shared setup file.

- **SearchPanel** (8 tests) -- conditional rendering, search input, close button, empty state, results display, result click
- **EditorTabs** (10 tests) -- tab name rendering (Welcome, Untitled, Settings, About, Trash, regular file), tab click, new tab, sidebar toggle, fullscreen toggle
- **WorkspaceWelcome** (8 tests) -- brand rendering, action buttons, recent workspaces list, keyboard shortcut hint

### New files

- `vitest.config.ts` -- jsdom environment, global setup
- `src/__tests__/setup.ts` -- mocks for `@tauri-apps/api/core`, `event`, `window`, `plugin-dialog`, `plugin-fs`
- `src/__tests__/components/SearchPanel.test.tsx`
- `src/__tests__/components/EditorTabs.test.tsx`
- `src/__tests__/components/WorkspaceWelcome.test.tsx`

## Playwright E2E Tests (42 tests)

Browser-based tests running against the Vite dev server. All selectors use `data-testid` attributes.

- **smoke.spec.ts** (5 tests) -- app load, page title, CSS variables, console errors, initial render
- **welcome.spec.ts** (9 tests) -- brand display, action buttons, description text, hint, recent workspaces, layout structure
- **layout.spec.ts** (10 tests) -- sidebar, editor area, file explorer, file tree, toolbar buttons
- **editor.spec.ts** (10 tests) -- tab bar, new tab creation, sidebar toggle, fullscreen, editor header, undo/redo, preview toggle
- **search.spec.ts** (8 tests) -- modal visibility, keyboard shortcut open/close, input focus, Escape close, button close, backdrop click

### New files

- `playwright.config.ts` -- CI-aware reporters, trace/video/screenshot on failure, auto-start Vite dev server
- `e2e/helpers.ts` -- shared locators (`sidebar`, `fileExplorer`, `editorTabs`, `searchModal`) and utilities (`resetApp`, `waitForWelcomePage`, `openSearch`, `clickNewTab`)
- `e2e/smoke.spec.ts`
- `e2e/welcome.spec.ts`
- `e2e/layout.spec.ts`
- `e2e/editor.spec.ts`
- `e2e/search.spec.ts`

## data-testid Instrumentation

37 attributes added across 7 components:

| Component | TestIDs |
|-----------|---------|
| WorkspaceWelcome | `welcome-page`, `welcome-create-new`, `welcome-open-folder`, `recent-workspace`, `recent-workspace-remove`, `welcome-hint` |
| MainLayout | `main-layout`, `sidebar`, `editor-area` |
| FileExplorer | `file-explorer`, `explorer-search`, `explorer-add-button`, `explorer-new-note`, `explorer-new-folder`, `file-tree`, `file-tree-empty`, `sidebar-settings-button`, `sidebar-trash-button` |
| EditorTabs | `editor-tabs`, `editor-tab`, `tab-close-button`, `new-tab-button`, `toggle-sidebar-button`, `fullscreen-button` |
| EditorPane | `editor-pane` |
| EditorHeader | `editor-header`, `undo-button`, `redo-button`, `preview-toggle` |
| SearchPanel | `search-backdrop`, `search-modal`, `search-input`, `search-loading`, `search-close-button`, `search-results`, `search-result-item`, `search-no-results` |

## CI Changes

Workflow files renamed for clarity and a new test pipeline added:

| File | Name | Purpose |
|------|------|---------|
| `build.yml` (was `ci.yml`) | Build | Lint, typecheck, prettier, Vite build, Tauri build |
| `tests.yml` | Tests | Rust tests, React component tests, Playwright E2E (parallel) |
| `node-setup.yml` (was `setup.yml`) | Node Setup | Reusable `npm ci` + `node_modules` cache |

The Playwright job uploads the HTML report as a GitHub artifact (14-day retention) for failure inspection.

## npm Scripts

| Script | Command |
|--------|---------|
| `test:rust` | `cargo test --manifest-path src-tauri/Cargo.toml` |
| `test:ui` | `vitest run --config vitest.config.ts` |
| `test:ui:watch` | `vitest --config vitest.config.ts` |
| `test:e2e` | `npx playwright test` |
| `test:e2e:ui` | `npx playwright test --ui` |
