//! Cinder Notes - A Tauri-based markdown note-taking application
//!
//! This is the main entry point for the Tauri backend.
//!
//! # Modules
//! - `types`: Data structures used throughout the app
//! - `workspace`: Workspace scanning and file tree operations
//! - `commands`: Tauri commands exposed to the frontend

mod commands;
mod trash;
mod types;
mod watcher;
mod workspace;

// Re-export types for use in other modules
pub use types::FileEntry;

use tauri::menu::{MenuBuilder, MenuItem, SubmenuBuilder};
use tauri::Emitter;
use tauri::Manager;

#[cfg(target_os = "macos")]
use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial, NSVisualEffectState};

#[cfg(target_os = "windows")]
use window_vibrancy::apply_acrylic;

/// Main entry point for the Tauri application
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .manage(watcher::FileWatcherState::new())
        .invoke_handler(tauri::generate_handler![
            commands::scan_workspace,
            commands::read_note,
            commands::write_note,
            commands::delete_note,
            commands::create_note,
            commands::rename_note,
            commands::create_folder,
            commands::delete_folder,
            commands::search_workspace,
            commands::watch_workspace,
            commands::unwatch_workspace,
            commands::list_trash,
            commands::restore_trash_item,
            commands::delete_trash_item,
            commands::empty_trash,
            commands::workspace_stats,
        ])
        .setup(|app| {
            // Apply native window vibrancy for the Aero UI effect
            #[allow(unused_variables)]
            if let Some(window) = app.get_webview_window("main") {
                #[cfg(target_os = "macos")]
                let _ = apply_vibrancy(
                    &window,
                    NSVisualEffectMaterial::UnderWindowBackground,
                    Some(NSVisualEffectState::Active),
                    None,
                );

                #[cfg(target_os = "windows")]
                let _ = apply_acrylic(&window, Some((18, 18, 18, 125)));
            }

            // Build a custom app menu without Cmd+W (Close Window)
            // macOS default menus include Window > Close bound to Cmd+W,
            // which kills the entire app. We override with a safe menu.
            let app_submenu = SubmenuBuilder::new(app, "Cinder Notes")
                .about(None)
                .separator()
                .services()
                .separator()
                .hide()
                .hide_others()
                .show_all()
                .separator()
                .quit()
                .build()?;

            let open_folder_item = MenuItem::with_id(
                app,
                "open-folder",
                "Open Folder...",
                true,
                Some("CmdOrCtrl+O"),
            )?;

            let close_workspace_item = MenuItem::with_id(
                app,
                "close-workspace",
                "Close Workspace",
                true,
                Some("CmdOrCtrl+Shift+W"),
            )?;

            let file_submenu = SubmenuBuilder::new(app, "File")
                .item(&open_folder_item)
                .item(&close_workspace_item)
                .build()?;

            let edit_submenu = SubmenuBuilder::new(app, "Edit")
                .undo()
                .redo()
                .separator()
                .cut()
                .copy()
                .paste()
                .separator()
                .select_all()
                .build()?;

            let menu = MenuBuilder::new(app)
                .item(&app_submenu)
                .item(&file_submenu)
                .item(&edit_submenu)
                .build()?;

            app.set_menu(menu)?;

            app.on_menu_event(|app_handle, event| match event.id().as_ref() {
                "open-folder" => {
                    let _ = app_handle.emit("menu-open-folder", ());
                }
                "close-workspace" => {
                    let _ = app_handle.emit("menu-close-workspace", ());
                }
                _ => {}
            });

            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
