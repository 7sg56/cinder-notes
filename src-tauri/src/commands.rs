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

/// Get the current platform
///
/// # Returns
/// * `"macos"`, `"windows"`, or `"linux"`
#[tauri::command]
pub fn get_platform() -> String {
    if cfg!(target_os = "macos") {
        "macos".to_string()
    } else if cfg!(target_os = "windows") {
        "windows".to_string()
    } else {
        "linux".to_string()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs::{self, File};
    use std::io::Write;
    use tempfile::tempdir;

    #[test]
    fn test_read_note_success() {
        let dir = tempdir().unwrap();
        let file_path = dir.path().join("test.md");
        let mut f = File::create(&file_path).unwrap();
        writeln!(f, "# Hello World").unwrap();

        let result = read_note(file_path.to_string_lossy().to_string());
        assert!(result.is_ok());
        assert!(result.unwrap().contains("# Hello World"));
    }

    #[test]
    fn test_read_note_nonexistent() {
        let result = read_note("/tmp/nonexistent_cinder_test_file.md".to_string());
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Failed to read file"));
    }

    #[test]
    fn test_write_note_success() {
        let dir = tempdir().unwrap();
        let file_path = dir.path().join("output.md");

        let result = write_note(
            file_path.to_string_lossy().to_string(),
            "# New Content".to_string(),
        );
        assert!(result.is_ok());
        assert_eq!(fs::read_to_string(&file_path).unwrap(), "# New Content");
    }

    #[test]
    fn test_create_note_empty_file() {
        let dir = tempdir().unwrap();
        let file_path = dir.path().join("new.md");

        let result = create_note(file_path.to_string_lossy().to_string());
        assert!(result.is_ok());
        assert!(file_path.exists());
        assert_eq!(fs::read_to_string(&file_path).unwrap(), "");
    }

    #[test]
    fn test_create_note_with_nested_dirs() {
        let dir = tempdir().unwrap();
        let file_path = dir.path().join("sub").join("deep").join("note.md");

        let result = create_note(file_path.to_string_lossy().to_string());
        assert!(result.is_ok());
        assert!(file_path.exists());
    }

    #[test]
    fn test_rename_note_success() {
        let dir = tempdir().unwrap();
        let old_path = dir.path().join("old.md");
        let new_path = dir.path().join("new.md");
        File::create(&old_path).unwrap();

        let result = rename_note(
            old_path.to_string_lossy().to_string(),
            new_path.to_string_lossy().to_string(),
        );
        assert!(result.is_ok());
        assert!(!old_path.exists());
        assert!(new_path.exists());
    }

    #[test]
    fn test_create_folder_success() {
        let dir = tempdir().unwrap();
        let folder_path = dir.path().join("new_folder");

        let result = create_folder(folder_path.to_string_lossy().to_string());
        assert!(result.is_ok());
        assert!(folder_path.is_dir());
    }

    #[test]
    fn test_create_folder_nested() {
        let dir = tempdir().unwrap();
        let folder_path = dir.path().join("a").join("b").join("c");

        let result = create_folder(folder_path.to_string_lossy().to_string());
        assert!(result.is_ok());
        assert!(folder_path.is_dir());
    }

    #[test]
    fn test_scan_workspace_success() {
        let dir = tempdir().unwrap();
        let mut f = File::create(dir.path().join("note.md")).unwrap();
        writeln!(f, "# Note").unwrap();
        File::create(dir.path().join("readme.txt")).unwrap();

        let result = scan_workspace(dir.path().to_string_lossy().to_string());
        assert!(result.is_ok());
        let entries = result.unwrap();
        assert_eq!(entries.len(), 1);
        assert_eq!(entries[0].name, "note.md");
    }

    #[test]
    fn test_scan_workspace_invalid_path() {
        let result = scan_workspace("/tmp/nonexistent_cinder_dir".to_string());
        assert!(result.is_err());
    }

    #[test]
    fn test_search_workspace_finds_matching_files() {
        let dir = tempdir().unwrap();
        File::create(dir.path().join("shopping-list.md")).unwrap();
        File::create(dir.path().join("diary.md")).unwrap();
        File::create(dir.path().join("notes.txt")).unwrap(); // not .md naming convention

        let result = search_workspace(
            dir.path().to_string_lossy().to_string(),
            "shopping".to_string(),
        );
        assert!(result.is_ok());
        let results = result.unwrap();
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].file_name, "shopping-list.md");
    }

    #[test]
    fn test_search_workspace_case_insensitive() {
        let dir = tempdir().unwrap();
        File::create(dir.path().join("MyNotes.md")).unwrap();

        let result = search_workspace(
            dir.path().to_string_lossy().to_string(),
            "mynotes".to_string(),
        );
        assert!(result.is_ok());
        assert_eq!(result.unwrap().len(), 1);
    }

    #[test]
    fn test_search_workspace_ignores_hidden_files() {
        let dir = tempdir().unwrap();
        File::create(dir.path().join(".hidden.md")).unwrap();
        File::create(dir.path().join("visible.md")).unwrap();

        let result = search_workspace(
            dir.path().to_string_lossy().to_string(),
            "hidden".to_string(),
        );
        assert!(result.is_ok());
        assert_eq!(result.unwrap().len(), 0);
    }

    #[test]
    fn test_search_workspace_searches_subdirectories() {
        let dir = tempdir().unwrap();
        let sub = dir.path().join("subfolder");
        fs::create_dir(&sub).unwrap();
        File::create(sub.join("deep-note.md")).unwrap();

        let result = search_workspace(dir.path().to_string_lossy().to_string(), "deep".to_string());
        assert!(result.is_ok());
        assert_eq!(result.unwrap().len(), 1);
    }

    #[test]
    fn test_workspace_stats_counts_md_files_only() {
        let dir = tempdir().unwrap();
        let mut f = File::create(dir.path().join("a.md")).unwrap();
        write!(f, "hello").unwrap();
        let mut f2 = File::create(dir.path().join("b.md")).unwrap();
        write!(f2, "world!").unwrap();
        File::create(dir.path().join("c.txt")).unwrap();

        let result = workspace_stats(dir.path().to_string_lossy().to_string());
        assert!(result.is_ok());
        let (count, bytes) = result.unwrap();
        assert_eq!(count, 2);
        assert_eq!(bytes, 11); // "hello" (5) + "world!" (6)
    }

    #[test]
    fn test_workspace_stats_ignores_hidden_dirs() {
        let dir = tempdir().unwrap();
        let hidden = dir.path().join(".hidden");
        fs::create_dir(&hidden).unwrap();
        let mut f = File::create(hidden.join("secret.md")).unwrap();
        write!(f, "secret").unwrap();

        let result = workspace_stats(dir.path().to_string_lossy().to_string());
        assert!(result.is_ok());
        let (count, _) = result.unwrap();
        assert_eq!(count, 0);
    }

    #[test]
    fn test_delete_note_moves_to_trash() {
        let dir = tempdir().unwrap();
        let file_path = dir.path().join("to_delete.md");
        let mut f = File::create(&file_path).unwrap();
        write!(f, "content").unwrap();

        let result = delete_note(
            file_path.to_string_lossy().to_string(),
            dir.path().to_string_lossy().to_string(),
        );
        assert!(result.is_ok());
        assert!(!file_path.exists());
        assert!(dir.path().join(".trash").exists());
    }

    #[test]
    fn test_delete_folder_moves_to_trash() {
        let dir = tempdir().unwrap();
        let folder_path = dir.path().join("my_folder");
        fs::create_dir(&folder_path).unwrap();
        File::create(folder_path.join("note.md")).unwrap();

        let result = delete_folder(
            folder_path.to_string_lossy().to_string(),
            dir.path().to_string_lossy().to_string(),
        );
        assert!(result.is_ok());
        assert!(!folder_path.exists());
        assert!(dir.path().join(".trash").exists());
    }
}
