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
use tauri::State;

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
    fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read file '{}': {}", path, e))
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
    fs::write(&path, &content)
        .map_err(|e| format!("Failed to write file '{}': {}", path, e))
}

/// Delete a markdown note
/// 
/// # Arguments
/// * `path` - Absolute path to the file
/// 
/// # Returns
/// * `Ok(())` - Success
/// * `Err(String)` - Error message if delete fails
#[tauri::command]
pub fn delete_note(path: String) -> Result<(), String> {
    fs::remove_file(&path)
        .map_err(|e| format!("Failed to delete file '{}': {}", path, e))
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
    fs::write(&path, "")
        .map_err(|e| format!("Failed to create file '{}': {}", path, e))
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
    fs::create_dir_all(&path)
        .map_err(|e| format!("Failed to create folder '{}': {}", path, e))
}

/// Delete a folder and all its contents
/// 
/// # Arguments
/// * `path` - Absolute path to the folder
/// 
/// # Returns
/// * `Ok(())` - Success  
/// * `Err(String)` - Error message if delete fails
#[tauri::command]
pub fn delete_folder(path: String) -> Result<(), String> {
    fs::remove_dir_all(&path)
        .map_err(|e| format!("Failed to delete folder '{}': {}", path, e))
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
                        let relative = path.strip_prefix(root)
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
pub fn unwatch_workspace(
    watcher_state: State<'_, FileWatcherState>,
) -> Result<(), String> {
    watcher_state.unwatch()
}
