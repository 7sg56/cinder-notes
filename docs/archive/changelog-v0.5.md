# Cinder Notes v0.5.0-pre.1 -- Theme Simplification & Platform Polish

Released: 2026-06-13

This release focuses on streamlining the theme system, making transparency a proper macOS-exclusive feature, and fixing the Windows title bar experience.

---

## Theme Simplification

### What Changed

The theme system was reduced from 12 themes to 3 core variants. The nine removed themes (Synthwave '84, GitHub Dark, Monokai Pro, Dracula, Nord, Forest, Muddy Mustard, Marine, Ember) were cut to keep the app focused and reduce maintenance surface.

### Remaining Themes

| Theme | Description | Transparency Support |
|-------|-------------|---------------------|
| **Cinder Dark** (default) | Dark zinc tones, `#141417` editor | Yes (macOS) |
| **Cinder Light** | Warm cream, `#fdfaf0` editor | Yes (macOS) |
| **Zen Black** | Pitch black, `#000000` editor | No (always opaque) |

### Files Modified

- [theme.css](file:///Users/7sg56/Developer/My%20Shit/Desktop_Apps/Cinder-notes/src/theme/theme.css) -- Reduced from 604 lines to ~150. All themes opaque by default.
- [ThemeSwitcher.tsx](file:///Users/7sg56/Developer/My%20Shit/Desktop_Apps/Cinder-notes/src/components/features/ThemeSwitcher.tsx) -- `THEMES` array trimmed to 3 entries.
- [Settings.tsx](file:///Users/7sg56/Developer/My%20Shit/Desktop_Apps/Cinder-notes/src/components/features/settings/Settings.tsx) -- Removed `THEME_PRESETS` for deleted themes, removed "More themes" expandable section.

---

## macOS-Only Transparency

### How It Works

All themes are **opaque by default** (`--aero-opacity: 1`). On macOS, a "Window Transparency" toggle in Settings adds the `.transparency-on` CSS class to `:root`, which:

- Lowers `--aero-opacity` to `0.25` (lets the native vibrancy effect show through `--bg-primary`)
- Converts `--bg-secondary` and `--bg-tertiary` to `rgba()` with `0.82` alpha

Zen Black ignores the toggle entirely -- it is always fully opaque.

On Windows/Linux, the toggle is hidden. The `.transparency-on` class is never applied. All surfaces are solid.

### Persistence

The transparency preference is stored in `localStorage` under the key `cinder-transparency` (`"true"` / `"false"`). On app startup, `App.tsx` reads this value and conditionally applies the class.

### Files Modified

- [theme.css](file:///Users/7sg56/Developer/My%20Shit/Desktop_Apps/Cinder-notes/src/theme/theme.css) -- Added `:root.transparency-on` and `:root.theme-cinder-light.transparency-on` overrides.
- [Settings.tsx](file:///Users/7sg56/Developer/My%20Shit/Desktop_Apps/Cinder-notes/src/components/features/settings/Settings.tsx) -- Added transparency toggle UI (macOS only, disabled for Zen Black).
- [ThemeSwitcher.tsx](file:///Users/7sg56/Developer/My%20Shit/Desktop_Apps/Cinder-notes/src/components/features/ThemeSwitcher.tsx) -- Removes `.transparency-on` when switching to Zen Black.
- [App.tsx](file:///Users/7sg56/Developer/My%20Shit/Desktop_Apps/Cinder-notes/src/App.tsx) -- Initializes transparency class on startup based on saved preference.

---

## Windows Title Bar Overhaul

### Problem

Windows showed a native menu bar ("Cinder Not | File | Edit") that:
- Truncated the app name
- Used system styling that clashed with the dark theme
- Looked unprofessional compared to the macOS experience

### Solution

1. **Removed native menu bar on Windows** -- Menu building in `lib.rs` is now wrapped with `#[cfg(target_os = "macos")]`. macOS menu goes to the system menu bar (top of screen). Windows gets no native menu.

2. **Removed native window decorations** -- Set `"decorations": false` in `tauri.conf.json`. macOS uses `titleBarStyle: "Overlay"` which takes precedence. Windows loses its native title bar.

3. **Custom title bar component** -- New `WindowsTitleBar.tsx` renders a 32px bar with:
   - Left: "Cinder Notes" label
   - Right: Minimize, Maximize/Restore, Close buttons
   - Full drag region for window movement
   - Red hover state on close button (Windows convention)
   - Maximize state tracking to swap icons

4. **Removed Windows acrylic** -- `apply_acrylic()` call and `window_vibrancy::apply_acrylic` import removed from `lib.rs`.

### Files Modified

- [lib.rs](file:///Users/7sg56/Developer/My%20Shit/Desktop_Apps/Cinder-notes/src-tauri/src/lib.rs) -- Removed acrylic, wrapped menu with `#[cfg(target_os = "macos")]`.
- [tauri.conf.json](file:///Users/7sg56/Developer/My%20Shit/Desktop_Apps/Cinder-notes/src-tauri/tauri.conf.json) -- Added `"decorations": false`.
- [WindowsTitleBar.tsx](file:///Users/7sg56/Developer/My%20Shit/Desktop_Apps/Cinder-notes/src/components/layout/WindowsTitleBar.tsx) -- **New file**.
- [MainLayout.tsx](file:///Users/7sg56/Developer/My%20Shit/Desktop_Apps/Cinder-notes/src/components/layout/MainLayout.tsx) -- Renders `<WindowsTitleBar />` on non-macOS.
- [WorkspaceWelcome.tsx](file:///Users/7sg56/Developer/My%20Shit/Desktop_Apps/Cinder-notes/src/components/onboarding/WorkspaceWelcome.tsx) -- Added `<WindowsTitleBar />` overlay for Windows.
- [FileExplorer.tsx](file:///Users/7sg56/Developer/My%20Shit/Desktop_Apps/Cinder-notes/src/components/layout/explorer/FileExplorer.tsx) -- Conditional drag spacer (46px macOS, 8px Windows).

---

## New Tauri Command

### `get_platform`

Returns the compile-target platform as a string.

```rust
#[tauri::command]
pub fn get_platform() -> String {
    if cfg!(target_os = "macos") { "macos" }
    else if cfg!(target_os = "windows") { "windows" }
    else { "linux" }
}
```

- [commands.rs](file:///Users/7sg56/Developer/My%20Shit/Desktop_Apps/Cinder-notes/src-tauri/src/commands.rs) -- Command implementation.
- [lib.rs](file:///Users/7sg56/Developer/My%20Shit/Desktop_Apps/Cinder-notes/src-tauri/src/lib.rs) -- Registered in `invoke_handler`.

---

## Version Bump

All version references updated from `0.2.0` to `0.5.0-pre.1`:

| File | Old | New |
|------|-----|-----|
| `package.json` | `0.2.0-pre.1` | `0.5.0-pre.1` |
| `tauri.conf.json` | `0.2.0` | `0.5.0-pre.1` |
| `Cargo.toml` | `0.2.0` | `0.5.0-pre.1` |
