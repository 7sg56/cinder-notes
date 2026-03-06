#!/usr/bin/env bash
#
# Creates GitHub issues for all features listed in changelogs/cinder-v0.2.md.
#
# Prerequisites:
#   - gh CLI installed and authenticated (`gh auth login`)
#
# Usage:
#   ./scripts/create-v0.2-issues.sh
#
set -euo pipefail

REPO="7sg56/cinder-notes"
MILESTONE="cinder-v0.2"

echo "Creating v0.2 feature issues for $REPO ..."

# ── Create the cinder-v0.2 milestone (idempotent) ────────────────────────────
if gh api "repos/$REPO/milestones" --jq ".[].title" | grep -qx "$MILESTONE"; then
  echo "ℹ️  Milestone '$MILESTONE' already exists — skipping creation."
else
  gh api "repos/$REPO/milestones" -f title="$MILESTONE" \
    -f description="Production readiness features tracked in changelogs/cinder-v0.2.md" \
    -f state="open" --silent
  echo "✅ Milestone '$MILESTONE' created."
fi

# ── 1. Search / Find in Files ────────────────────────────────────────────────
gh issue create --repo "$REPO" \
  --milestone "$MILESTONE" \
  --title "[Critical] Search / Find in Files (Cmd+F / Cmd+Shift+F)" \
  --label "enhancement" \
  --body "## Priority: Critical (Ship Blocker)

There is no way to search within a note or across the workspace. For a notes app this is non-negotiable.

### Scope

- **In-editor find** — Already handled by CodeMirror's \`@codemirror/search\` extension. Just needs to be enabled.
- **Global search across files** — A new Tauri command to grep workspace files, plus a search UI panel.

### Frontend Changes

- **[MODIFY] \`CodeMirrorEditor.tsx\`** — Add \`@codemirror/search\` extension to enable built-in Cmd+F find/replace inside the editor.
- **[NEW] \`SearchPanel.tsx\`** — A global search UI (opened via Cmd+Shift+F) that displays results across all workspace files with file name, line number, and content preview. Clicking a result opens the file.
- **[MODIFY] \`useKeyboardShortcuts.ts\`** — Add Cmd+Shift+F shortcut to toggle the global search panel.
- **[MODIFY] \`useAppStore.ts\`** — Add \`isSearchOpen\` / \`searchQuery\` / \`searchResults\` state + actions.

### Backend Changes

- **[MODIFY] \`commands.rs\`** — Add \`search_workspace\` command that recursively searches \`.md\` files for a query string, returning matching file paths, line numbers, and snippets.
- **[MODIFY] \`lib.rs\`** — Register the new command.

### Verification

- Open the app, press Cmd+F in editor to verify in-file search works.
- Press Cmd+Shift+F to verify global search panel opens and returns results.

_Source: changelogs/cinder-v0.2.md_"
echo "✅ Issue 1 created: Search / Find in Files"

# ── 2. Workspace Persistence ─────────────────────────────────────────────────
gh issue create --repo "$REPO" \
  --milestone "$MILESTONE" \
  --title "[Critical] Workspace Persistence (Remember Last Workspace)" \
  --label "enhancement" \
  --body "## Priority: Critical (Ship Blocker)

The app loses the workspace every time it restarts. Users have to re-select their folder on every launch.

### Scope

Use Tauri's \`tauri-plugin-store\` (a JSON key-value store) to persist the last workspace path and restore it on launch.

### Backend / Config Changes

- **[MODIFY] \`Cargo.toml\`** — Add \`tauri-plugin-store\` dependency.
- **[MODIFY] \`lib.rs\`** — Register the store plugin.

### Frontend Changes

- **[MODIFY] \`useWorkspace.ts\`** — After loading a workspace, persist the path to the store. On app init, read the stored path and auto-load the workspace.
- **[MODIFY] \`App.tsx\`** — On mount, attempt to restore the last workspace before showing the welcome screen.

### Verification

- Open a workspace, quit the app, relaunch — verify it auto-loads the last workspace without prompting.

_Source: changelogs/cinder-v0.2.md_"
echo "✅ Issue 2 created: Workspace Persistence"

# ── 3. Confirmation Dialog for Destructive Actions ───────────────────────────
gh issue create --repo "$REPO" \
  --milestone "$MILESTONE" \
  --title "[Critical] Confirmation Dialog for Destructive Actions" \
  --label "enhancement,bug" \
  --body "## Priority: Critical (Ship Blocker)

Currently \`deleteFile\` and \`deleteFolder\` execute immediately with no confirmation. One misclick permanently deletes user data.

### Scope

Show a native Tauri confirmation dialog before deleting files/folders.

### Frontend Changes

- **[MODIFY] \`useAppStore.ts\`** — Wrap \`deleteFile\` and \`deleteFolder\` with \`await ask()\` from \`@tauri-apps/plugin-dialog\` so the user must confirm before deletion.

### Verification

- Right-click a file, click \"Move to Trash\" — verify a native confirmation dialog appears before deletion.

> ⚠️ **This is a data-safety issue.** Right now a single misclick permanently deletes files with no recovery. This should be the absolute first fix.

_Source: changelogs/cinder-v0.2.md_"
echo "✅ Issue 3 created: Confirmation Dialog for Destructive Actions"

# ── 4. Unsaved Changes Indicator ─────────────────────────────────────────────
gh issue create --repo "$REPO" \
  --milestone "$MILESTONE" \
  --title "[Important] Unsaved Changes Indicator" \
  --label "enhancement" \
  --body "## Priority: Important (Users Will Notice Immediately)

The app auto-saves, but when auto-save is off (manual mode), there is no visual indicator that a file has unsaved changes, and closing a tab silently discards edits.

### Scope

- Track a \`dirtyFiles\` set in the store (files with unsaved changes).
- Show a dot/indicator on dirty tabs.
- Prompt before closing a dirty tab.

### Frontend Changes

- **[MODIFY] \`useAppStore.ts\`** — Add \`dirtyFiles: Set<string>\` state. Mark files dirty on edit, clean on save. Before closing a dirty file, prompt with a save dialog.
- **[MODIFY] \`EditorTabs.tsx\`** — Show a dot indicator on tabs that have unsaved changes.

### Verification

- Toggle auto-save off, edit a file, verify the tab shows a dirty dot.
- Try closing the tab, verify a save prompt appears.

_Source: changelogs/cinder-v0.2.md_"
echo "✅ Issue 4 created: Unsaved Changes Indicator"

# ── 5. Export to Markdown / HTML ─────────────────────────────────────────────
gh issue create --repo "$REPO" \
  --milestone "$MILESTONE" \
  --title "[Important] Export to Markdown / HTML" \
  --label "enhancement" \
  --body "## Priority: Important (Users Will Notice Immediately)

Users need to be able to export their notes. At minimum: copy as Markdown and export as standalone HTML.

### Scope

Add export options to the editor's \`MoreVertical\` menu (which is currently a no-op button).

### Frontend Changes

- **[MODIFY] \`EditorHeader.tsx\`** — Wire the \`MoreVertical\` button to show a dropdown with \"Export as Markdown\" and \"Export as HTML\" options.
- **[NEW] \`exportUtils.ts\`** — Utility functions: \`exportAsMarkdown\` (save \`.md\` file via Tauri save dialog) and \`exportAsHTML\` (render the markdown to HTML with styles, save via Tauri save dialog).

### Verification

- Open a note, click the \`...\` menu, verify \"Export as Markdown\" and \"Export as HTML\" save files correctly.

_Source: changelogs/cinder-v0.2.md_"
echo "✅ Issue 5 created: Export to Markdown / HTML"

# ── 6. Wire General Settings ─────────────────────────────────────────────────
gh issue create --repo "$REPO" \
  --milestone "$MILESTONE" \
  --title "[Important] Wire General Settings" \
  --label "enhancement" \
  --body "## Priority: Important (Users Will Notice Immediately)

The \`GeneralSettings\` panel is a visual shell — the dropdowns don't persist or do anything. Either wire them up or remove them so users aren't confused.

### Scope

For v1/production, the simplest approach is to make the settings functional or clearly mark them as \"Coming Soon.\"

### Frontend Changes

- **[MODIFY] \`GeneralSettings.tsx\`** — Either connect the dropdowns to persisted state (via \`tauri-plugin-store\`), or add \"Coming Soon\" badges and disable the selects.

### Verification

- Open General Settings, change a dropdown value, close and reopen settings — verify the value persists. Alternatively verify \"Coming Soon\" badges are shown and dropdowns are disabled.

_Source: changelogs/cinder-v0.2.md_"
echo "✅ Issue 6 created: Wire General Settings"

# ── 7. Recent Workspaces List ────────────────────────────────────────────────
gh issue create --repo "$REPO" \
  --milestone "$MILESTONE" \
  --title "[Nice-to-Have] Recent Workspaces List" \
  --label "enhancement" \
  --body "## Priority: Nice-to-Have (Can Ship Without)

Show a list of recently opened workspaces on the welcome screen so users can quickly switch between projects.

### Scope

- Persist a list of recently opened workspace paths (e.g., via \`tauri-plugin-store\`).
- Display the list on the welcome/landing screen.
- Allow clicking an entry to open that workspace directly.

_Source: changelogs/cinder-v0.2.md_"
echo "✅ Issue 7 created: Recent Workspaces List"

# ── 8. Move to Trash Instead of Permanent Delete ─────────────────────────────
gh issue create --repo "$REPO" \
  --milestone "$MILESTONE" \
  --title "[Nice-to-Have] Move to Trash Instead of Permanent Delete" \
  --label "enhancement" \
  --body "## Priority: Nice-to-Have (Can Ship Without)

Currently \`delete_note\` uses \`fs::remove_file\` which is permanent. Using the OS trash (\`trash\` crate on the Rust side) would be safer and match what \"Move to Trash\" in the context menu implies.

### Scope

- Replace \`fs::remove_file\` / \`fs::remove_dir_all\` with the \`trash\` crate's \`delete\` function.
- Ensure cross-platform support (macOS, Windows, Linux).

_Source: changelogs/cinder-v0.2.md_"
echo "✅ Issue 8 created: Move to Trash Instead of Permanent Delete"

# ── 9. Drag-and-Drop File Import ─────────────────────────────────────────────
gh issue create --repo "$REPO" \
  --milestone "$MILESTONE" \
  --title "[Nice-to-Have] Drag-and-Drop File Import" \
  --label "enhancement" \
  --body "## Priority: Nice-to-Have (Can Ship Without)

Allow dragging \`.md\` files from Finder/Explorer into the workspace to import them.

### Scope

- Listen for drag-and-drop events on the workspace panel.
- Copy dropped \`.md\` files into the current workspace directory.
- Refresh the file tree after import.

_Source: changelogs/cinder-v0.2.md_"
echo "✅ Issue 9 created: Drag-and-Drop File Import"

# ── 10. Note Pinning ─────────────────────────────────────────────────────────
gh issue create --repo "$REPO" \
  --milestone "$MILESTONE" \
  --title "[Nice-to-Have] Note Pinning" \
  --label "enhancement" \
  --body "## Priority: Nice-to-Have (Can Ship Without)

Allow users to pin frequently accessed notes to the top of the explorer or tabs.

### Scope

- Add a \"Pin\" option to the file context menu and/or tab context menu.
- Persist pinned state (e.g., via \`tauri-plugin-store\`).
- Display pinned notes at the top of the file explorer and/or tab bar with a pin icon.

_Source: changelogs/cinder-v0.2.md_"
echo "✅ Issue 10 created: Note Pinning"

echo ""
echo "🎉 All 10 v0.2 issues created successfully!"
