# Cinder Notes -- Production Readiness Gaps

After auditing the full codebase, here are the features that a notes app **must have** before shipping, ordered by priority. I've separated them into **critical** (ship-blockers), **important** (users will notice immediately), and **nice-to-have** (can ship without, but should come soon).

---

## Critical (Ship Blockers)

### 1. Search / Find in Files (Cmd+F / Cmd+Shift+F)

There is no way to search within a note or across the workspace. For a notes app this is non-negotiable.

**Scope:**
- **In-editor find** -- Already handled by CodeMirror's `@codemirror/search` extension. Just needs to be enabled.
- **Global search across files** -- A new Tauri command to grep workspace files, plus a search UI panel.

#### Frontend
- [MODIFY] [CodeMirrorEditor.tsx](file:///Users/7sg56/Developer/My%20Shit/Desktop_Apps/Cinder-notes/src/components/layout/editor/CodeMirrorEditor.tsx) -- Add `@codemirror/search` extension to enable built-in Cmd+F find/replace inside the editor.
- [NEW] [SearchPanel.tsx](file:///Users/7sg56/Developer/My%20Shit/Desktop_Apps/Cinder-notes/src/components/features/SearchPanel.tsx) -- A global search UI (opened via Cmd+Shift+F) that displays results across all workspace files with file name, line number, and content preview. Clicking a result opens the file.
- [MODIFY] [useKeyboardShortcuts.ts](file:///Users/7sg56/Developer/My%20Shit/Desktop_Apps/Cinder-notes/src/hooks/useKeyboardShortcuts.ts) -- Add Cmd+Shift+F shortcut to toggle the global search panel.
- [MODIFY] [useAppStore.ts](file:///Users/7sg56/Developer/My%20Shit/Desktop_Apps/Cinder-notes/src/store/useAppStore.ts) -- Add `isSearchOpen` / `searchQuery` / `searchResults` state + actions.

#### Backend
- [MODIFY] [commands.rs](file:///Users/7sg56/Developer/My%20Shit/Desktop_Apps/Cinder-notes/src-tauri/src/commands.rs) -- Add `search_workspace` command that recursively searches `.md` files for a query string, returning matching file paths, line numbers, and snippets.
- [MODIFY] [lib.rs](file:///Users/7sg56/Developer/My%20Shit/Desktop_Apps/Cinder-notes/src-tauri/src/lib.rs) -- Register the new command.

---

### 2. Workspace Persistence (Remember Last Workspace)

The app loses the workspace every time it restarts. Users have to re-select their folder on every launch.

**Scope:** Use Tauri's `tauri-plugin-store` (a JSON key-value store) to persist the last workspace path and restore it on launch.

#### Backend / Config
- [MODIFY] [Cargo.toml](file:///Users/7sg56/Developer/My%20Shit/Desktop_Apps/Cinder-notes/src-tauri/Cargo.toml) -- Add `tauri-plugin-store` dependency.
- [MODIFY] [lib.rs](file:///Users/7sg56/Developer/My%20Shit/Desktop_Apps/Cinder-notes/src-tauri/src/lib.rs) -- Register the store plugin.

#### Frontend
- [MODIFY] [useWorkspace.ts](file:///Users/7sg56/Developer/My%20Shit/Desktop_Apps/Cinder-notes/src/hooks/useWorkspace.ts) -- After loading a workspace, persist the path to the store. On app init, read the stored path and auto-load the workspace.
- [MODIFY] [App.tsx](file:///Users/7sg56/Developer/My%20Shit/Desktop_Apps/Cinder-notes/src/App.tsx) -- On mount, attempt to restore the last workspace before showing the welcome screen.

---

### 3. Confirmation Dialog for Destructive Actions

Currently `deleteFile` and `deleteFolder` execute immediately with no confirmation. One misclick permanently deletes user data.

**Scope:** Show a native Tauri confirmation dialog before deleting files/folders.

#### Frontend
- [MODIFY] [useAppStore.ts](file:///Users/7sg56/Developer/My%20Shit/Desktop_Apps/Cinder-notes/src/store/useAppStore.ts) -- Wrap `deleteFile` and `deleteFolder` with `await ask()` from `@tauri-apps/plugin-dialog` so the user must confirm before deletion.

---

## Important (Users Will Notice Immediately)

### 4. Unsaved Changes Indicator

The app auto-saves, but when auto-save is off (manual mode), there is no visual indicator that a file has unsaved changes, and closing a tab silently discards edits.

**Scope:**
- Track a `dirtyFiles` set in the store (files with unsaved changes).
- Show a dot/indicator on dirty tabs.
- Prompt before closing a dirty tab.

#### Frontend
- [MODIFY] [useAppStore.ts](file:///Users/7sg56/Developer/My%20Shit/Desktop_Apps/Cinder-notes/src/store/useAppStore.ts) -- Add `dirtyFiles: Set<string>` state. Mark files dirty on edit, clean on save. Before closing a dirty file, prompt with a save dialog.
- [MODIFY] [EditorTabs.tsx](file:///Users/7sg56/Developer/My%20Shit/Desktop_Apps/Cinder-notes/src/components/layout/editor/EditorTabs.tsx) -- Show a dot indicator on tabs that have unsaved changes.

---

### 5. Export to Markdown / HTML

Users need to be able to export their notes. At minimum: copy as Markdown and export as standalone HTML.

**Scope:** Add export options to the editor's `MoreVertical` menu (which is currently a no-op button).

#### Frontend
- [MODIFY] [EditorHeader.tsx](file:///Users/7sg56/Developer/My%20Shit/Desktop_Apps/Cinder-notes/src/components/layout/editor/EditorHeader.tsx) -- Wire the `MoreVertical` button to show a dropdown with "Export as Markdown" and "Export as HTML" options.
- [NEW] [exportUtils.ts](file:///Users/7sg56/Developer/My%20Shit/Desktop_Apps/Cinder-notes/src/util/exportUtils.ts) -- Utility functions: `exportAsMarkdown` (save `.md` file via Tauri save dialog) and `exportAsHTML` (render the markdown to HTML with styles, save via Tauri save dialog).

---

### 6. Wire General Settings

The `GeneralSettings` panel is a visual shell -- the dropdowns don't persist or do anything. Either wire them up or remove them so users aren't confused.

**Scope:** For v1/production, the simplest approach is to make the settings functional or clearly mark them as "Coming Soon."

#### Frontend
- [MODIFY] [GeneralSettings.tsx](file:///Users/7sg56/Developer/My%20Shit/Desktop_Apps/Cinder-notes/src/components/features/settings/GeneralSettings.tsx) -- Either connect the dropdowns to persisted state (via `tauri-plugin-store`), or add "Coming Soon" badges and disable the selects.

---

## Nice-to-Have (Can Ship Without)

### 7. Recent Workspaces List

Show a list of recently opened workspaces on the welcome screen so users can quickly switch between projects.

### 8. Move to Trash Instead of Permanent Delete

Currently `delete_note` uses `fs::remove_file` which is permanent. Using the OS trash (`trash` crate on Rust side) would be safer and match what "Move to Trash" in the context menu implies.

### 9. Drag-and-Drop File Import

Allow dragging `.md` files from Finder/Explorer into the workspace to import them.

### 10. Note Pinning

Allow users to pin frequently accessed notes to the top of the explorer or tabs.

---

## User Review Required

> [!IMPORTANT]
> Which of these do you want me to implement? I recommend at minimum items **1 through 5** (Search, Workspace Persistence, Delete Confirmation, Unsaved Indicator, and Export). Items 6-10 are lower priority and can be deferred to a fast-follow release.

> [!WARNING]
> Item 3 (Delete Confirmation) is a data-safety issue. Right now a single misclick permanently deletes files with no recovery. This should be the absolute first fix.

---

## Verification Plan

### Automated Tests
- The Rust `workspace.rs` already has unit tests. New `search_workspace` logic will get similar tests using `tempdir` + test files.
- Run Rust tests: `cd src-tauri && cargo test`

### Manual Verification
- **Search:** Open the app, press Cmd+F in editor to verify in-file search works. Press Cmd+Shift+F to verify global search panel opens and returns results.
- **Workspace Persistence:** Open a workspace, quit the app, relaunch -- verify it auto-loads the last workspace without prompting.
- **Delete Confirmation:** Right-click a file, click "Move to Trash" -- verify a native confirmation dialog appears before deletion.
- **Unsaved Indicator:** Toggle auto-save off, edit a file, verify the tab shows a dirty dot. Try closing the tab, verify a save prompt appears.
- **Export:** Open a note, click the `...` menu, verify "Export as Markdown" and "Export as HTML" save files correctly.
- **Build:** Run `npm run build` and `npm run tauri:build` to verify no build regressions.
