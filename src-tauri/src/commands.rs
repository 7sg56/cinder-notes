//! Tauri commands exposed to the frontend
//!
//! All commands follow the pattern:
//! - Accept simple types (String, etc.)
//! - Return Result<T, String> for error handling
//! - Use descriptive error messages

use crate::types::FileEntry;
use crate::watcher::FileWatcherState;
use crate::workspace::{scan_directory_recursive, validate_workspace_path};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use tauri::{Manager, State};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResult {
    pub file_path: String,
    pub file_name: String,
    pub line_number: usize,
    pub content_preview: String,
}

/// Scan a workspace directory and return the file tree
///
/// # Arguments
/// * `path` - Absolute path to the workspace directory
///
/// # Returns
/// * `Ok(Vec<FileEntry>)` - List of files and folders
/// * `Err(String)` - Error message if scan fails
#[tauri::command]
pub fn scan_workspace(path: String) -> Result<Vec<FileEntry>, String> {
    let workspace_path = Path::new(&path);
    validate_workspace_path(workspace_path)?;
    scan_directory_recursive(workspace_path)
}

/// Read the content of a markdown note
///
/// # Arguments
/// * `path` - Absolute path to the file
///
/// # Returns
/// * `Ok(String)` - File content
/// * `Err(String)` - Error message if read fails
#[tauri::command]
pub fn read_note(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| format!("Failed to read file '{}': {}", path, e))
}

/// Write content to a markdown note
///
/// # Arguments
/// * `path` - Absolute path to the file
/// * `content` - Content to write
///
/// # Returns
/// * `Ok(())` - Success
/// * `Err(String)` - Error message if write fails
#[tauri::command]
pub fn write_note(path: String, content: String) -> Result<(), String> {
    fs::write(&path, &content).map_err(|e| format!("Failed to write file '{}': {}", path, e))
}

/// Delete a markdown note by moving it to the workspace's `.trash/` directory
///
/// # Arguments
/// * `path` - Absolute path to the file
/// * `workspace_path` - Absolute path to the workspace root
///
/// # Returns
/// * `Ok(())` - Success
/// * `Err(String)` - Error message if trash fails
#[tauri::command]
pub fn delete_note(path: String, workspace_path: String) -> Result<(), String> {
    crate::trash::move_to_trash(Path::new(&workspace_path), Path::new(&path), "file").map(|_| ())
}

/// Create a new empty markdown note
///
/// Creates parent directories if they don't exist.
///
/// # Arguments
/// * `path` - Absolute path for the new file
///
/// # Returns
/// * `Ok(())` - Success
/// * `Err(String)` - Error message if creation fails
#[tauri::command]
pub fn create_note(path: String) -> Result<(), String> {
    // Create parent directories if they don't exist
    if let Some(parent) = Path::new(&path).parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create directories for '{}': {}", path, e))?;
    }
    fs::write(&path, "").map_err(|e| format!("Failed to create file '{}': {}", path, e))
}

/// Rename/move a markdown note
///
/// # Arguments
/// * `old_path` - Current absolute path
/// * `new_path` - New absolute path
///
/// # Returns
/// * `Ok(())` - Success
/// * `Err(String)` - Error message if rename fails
#[tauri::command]
pub fn rename_note(old_path: String, new_path: String) -> Result<(), String> {
    fs::rename(&old_path, &new_path)
        .map_err(|e| format!("Failed to rename '{}' to '{}': {}", old_path, new_path, e))
}

/// Create a new folder
///
/// Creates all parent directories as needed.
///
/// # Arguments
/// * `path` - Absolute path for the new folder
///
/// # Returns
/// * `Ok(())` - Success
/// * `Err(String)` - Error message if creation fails
#[tauri::command]
pub fn create_folder(path: String) -> Result<(), String> {
    fs::create_dir_all(&path).map_err(|e| format!("Failed to create folder '{}': {}", path, e))
}

/// Delete a folder and all its contents by moving it to the workspace's `.trash/` directory
///
/// # Arguments
/// * `path` - Absolute path to the folder
/// * `workspace_path` - Absolute path to the workspace root
///
/// # Returns
/// * `Ok(())` - Success
/// * `Err(String)` - Error message if trash fails
#[tauri::command]
pub fn delete_folder(path: String, workspace_path: String) -> Result<(), String> {
    crate::trash::move_to_trash(Path::new(&workspace_path), Path::new(&path), "folder").map(|_| ())
}

/// Search workspace for files whose name matches a query
///
/// Only matches against file names (not content). This is used for
/// the global file finder (Cmd+Shift+F).
///
/// # Arguments
/// * `path` - Absolute path to the workspace directory
/// * `query` - Search string to match against file names
///
/// # Returns
/// * `Ok(Vec<SearchResult>)` - List of matching files
/// * `Err(String)` - Error message if scan fails
#[tauri::command]
pub fn search_workspace(path: String, query: String) -> Result<Vec<SearchResult>, String> {
    let workspace_path = Path::new(&path);
    validate_workspace_path(workspace_path)?;

    let mut results = Vec::new();
    let query_lower = query.to_lowercase();

    fn search_dir(dir: &Path, root: &Path, query_lower: &str, results: &mut Vec<SearchResult>) {
        let read_dir = match fs::read_dir(dir) {
            Ok(rd) => rd,
            Err(_) => return,
        };
        for entry in read_dir {
            let entry = match entry {
                Ok(e) => e,
                Err(_) => continue,
            };
            let path = entry.path();
            let file_name = entry.file_name().to_string_lossy().to_string();

            if file_name.starts_with('.') {
                continue;
            }

            if let Ok(metadata) = entry.metadata() {
                if metadata.is_dir() {
                    search_dir(&path, root, query_lower, results);
                } else if file_name.ends_with(".md") {
                    if file_name.to_lowercase().contains(query_lower) {
                        // Build a relative path for display
                        let relative = path
                            .strip_prefix(root)
                            .map(|p| p.to_string_lossy().to_string())
                            .unwrap_or_else(|_| file_name.clone());

                        results.push(SearchResult {
                            file_path: path.to_string_lossy().to_string(),
                            file_name: file_name.clone(),
                            line_number: 0,
                            content_preview: relative,
                        });
                    }
                }
            }
        }
    }

    search_dir(workspace_path, workspace_path, &query_lower, &mut results);
    Ok(results)
}

/// Start watching a workspace directory for external file changes
///
/// # Arguments
/// * `path` - Absolute path to the workspace directory
/// * `app_handle` - Tauri app handle for emitting events
/// * `watcher_state` - Managed file watcher state
///
/// # Returns
/// * `Ok(())` - Watcher started successfully
/// * `Err(String)` - Error message if watching fails
#[tauri::command]
pub fn watch_workspace(
    path: String,
    app_handle: tauri::AppHandle,
    watcher_state: State<'_, FileWatcherState>,
) -> Result<(), String> {
    watcher_state.watch(&path, app_handle)
}

/// Stop watching the workspace directory
///
/// # Arguments
/// * `watcher_state` - Managed file watcher state
///
/// # Returns
/// * `Ok(())` - Watcher stopped successfully
/// * `Err(String)` - Error message if stopping fails
#[tauri::command]
pub fn unwatch_workspace(watcher_state: State<'_, FileWatcherState>) -> Result<(), String> {
    watcher_state.unwatch()
}

/// Open the standalone onboarding window
///
/// We do this from Rust to avoid frontend capability restrictions on window creation.
///
/// # Arguments
/// * `app` - Tauri AppHandle
///
/// # Returns
/// * `Ok(())` - Window created or focused
/// * `Err(String)` - Error message if creation fails
#[tauri::command]
pub fn open_onboarding_window(app: tauri::AppHandle) -> Result<(), String> {
    println!("open_onboarding_window command invoked!");
    if let Some(window) = app.get_webview_window("onboarding") {
        println!("onboarding window already exists, focusing it.");
        let _ = window.set_focus();
        return Ok(());
    }

    println!("onboarding window does not exist, building it now...");
    let builder = tauri::WebviewWindowBuilder::new(
        &app,
        "onboarding",
        tauri::WebviewUrl::App("index.html".into()),
    )
    .title("Welcome to Cinder Notes")
    .inner_size(800.0, 500.0)
    .center()
    .resizable(false)
    .maximizable(false);

    let win = builder.build().map_err(|e| {
        println!("Failed to build onboarding window: {}", e);
        format!("Failed to build window: {}", e)
    })?;

    println!("onboarding window built successfully! calling show()...");
    let _ = win.show();
    Ok(())
}

/// List all items currently in the workspace trash
///
/// # Arguments
/// * `workspace_path` - Absolute path to the workspace root
///
/// # Returns
/// * `Ok(Vec<TrashEntry>)` - List of trashed items
/// * `Err(String)` - Error message if listing fails
#[tauri::command]
pub fn list_trash(workspace_path: String) -> Result<Vec<crate::trash::TrashEntry>, String> {
    crate::trash::read_manifest(Path::new(&workspace_path))
}

/// Restore a single item from trash back to its original location
///
/// # Arguments
/// * `workspace_path` - Absolute path to the workspace root
/// * `trash_id` - ID of the trash entry to restore
///
/// # Returns
/// * `Ok(String)` - The original path the item was restored to
/// * `Err(String)` - Error message if restore fails
#[tauri::command]
pub fn restore_trash_item(workspace_path: String, trash_id: String) -> Result<String, String> {
    crate::trash::restore_item(Path::new(&workspace_path), &trash_id)
}

/// Permanently delete a single item from the trash
///
/// # Arguments
/// * `workspace_path` - Absolute path to the workspace root
/// * `trash_id` - ID of the trash entry to delete
///
/// # Returns
/// * `Ok(())` - Success
/// * `Err(String)` - Error message if deletion fails
#[tauri::command]
pub fn delete_trash_item(workspace_path: String, trash_id: String) -> Result<(), String> {
    crate::trash::delete_item(Path::new(&workspace_path), &trash_id)
}

/// Permanently delete all items in the workspace trash
///
/// # Arguments
/// * `workspace_path` - Absolute path to the workspace root
///
/// # Returns
/// * `Ok(())` - Success
/// * `Err(String)` - Error message if emptying fails
#[tauri::command]
pub fn empty_trash(workspace_path: String) -> Result<(), String> {
    crate::trash::empty_all(Path::new(&workspace_path))
}

/// Get workspace statistics (total file count and size)
///
/// Recursively walks the workspace, excluding hidden directories (`.trash`, etc.).
/// Only counts `.md` files to match what the explorer shows.
///
/// # Returns
/// * `Ok((file_count, total_bytes))` - Tuple of file count and total size
#[tauri::command]
pub fn workspace_stats(workspace_path: String) -> Result<(u64, u64), String> {
    fn walk(dir: &Path, file_count: &mut u64, total_bytes: &mut u64) -> Result<(), String> {
        let entries = fs::read_dir(dir)
            .map_err(|e| format!("Failed to read dir '{}': {}", dir.display(), e))?;
        for entry in entries {
            let entry = entry.map_err(|e| e.to_string())?;
            let path = entry.path();
            let name = entry.file_name().to_string_lossy().to_string();

            if name.starts_with('.') {
                continue;
            }

            if path.is_dir() {
                walk(&path, file_count, total_bytes)?;
            } else if name.ends_with(".md") {
                *file_count += 1;
                if let Ok(meta) = fs::metadata(&path) {
                    *total_bytes += meta.len();
                }
            }
        }
        Ok(())
    }

    let mut file_count = 0u64;
    let mut total_bytes = 0u64;
    walk(
        Path::new(&workspace_path),
        &mut file_count,
        &mut total_bytes,
    )?;
    Ok((file_count, total_bytes))
}
