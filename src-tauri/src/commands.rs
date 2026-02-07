//! Tauri commands exposed to the frontend
//! 
//! All commands follow the pattern:
//! - Accept simple types (String, etc.)
//! - Return Result<T, String> for error handling
//! - Use descriptive error messages

use crate::types::FileEntry;
use crate::workspace::{scan_directory_recursive, validate_workspace_path};
use std::fs;
use std::path::Path;

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
