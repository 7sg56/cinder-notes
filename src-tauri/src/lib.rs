//! Cinder Notes - A Tauri-based markdown note-taking application
//!
//! This is the main entry point for the Tauri backend.
//! 
//! # Modules
//! - `types`: Data structures used throughout the app
//! - `workspace`: Workspace scanning and file tree operations
//! - `commands`: Tauri commands exposed to the frontend

mod commands;
mod types;
mod workspace;

// Re-export types for use in other modules
pub use types::FileEntry;

/// Main entry point for the Tauri application
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            commands::scan_workspace,
            commands::read_note,
            commands::write_note,
            commands::delete_note,
            commands::create_note,
            commands::rename_note,
            commands::create_folder,
            commands::delete_folder,
        ])
        .setup(|app| {
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
