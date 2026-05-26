//! Per-workspace trash system
//!
//! Manages a `.trash/` directory inside each workspace, with a JSON manifest
//! that tracks the original location of each trashed item so it can be restored.

use chrono::Utc;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};

/// A single entry in the trash manifest.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrashEntry {
    pub id: String,
    pub original_name: String,
    pub original_path: String,
    pub relative_path: String,
    pub trashed_name: String,
    pub trashed_at: String,
    pub entry_type: String, // "file" or "folder"
}

/// Returns the path to the workspace's `.trash/` directory.
pub fn trash_dir(workspace: &Path) -> PathBuf {
    workspace.join(".trash")
}

/// Returns the path to the trash manifest file.
pub fn manifest_path(workspace: &Path) -> PathBuf {
    trash_dir(workspace).join(".manifest.json")
}

/// Reads the trash manifest. Returns an empty vec if the file doesn't exist.
pub fn read_manifest(workspace: &Path) -> Result<Vec<TrashEntry>, String> {
    let path = manifest_path(workspace);
    if !path.exists() {
        return Ok(Vec::new());
    }
    let data =
        fs::read_to_string(&path).map_err(|e| format!("Failed to read trash manifest: {}", e))?;
    let entries: Vec<TrashEntry> = serde_json::from_str(&data)
        .map_err(|e| format!("Failed to parse trash manifest: {}", e))?;
    Ok(entries)
}

/// Writes the trash manifest as pretty-printed JSON.
pub fn write_manifest(workspace: &Path, entries: &[TrashEntry]) -> Result<(), String> {
    let path = manifest_path(workspace);
    let json = serde_json::to_string_pretty(entries)
        .map_err(|e| format!("Failed to serialize trash manifest: {}", e))?;
    fs::write(&path, json).map_err(|e| format!("Failed to write trash manifest: {}", e))?;
    Ok(())
}

/// Move an item (file or folder) into the workspace's `.trash/` directory.
///
/// - Creates `.trash/` if it doesn't exist.
/// - Generates a unique ID from the current UTC timestamp in milliseconds.
/// - Handles name collisions by appending `_1`, `_2`, etc.
/// - Records the entry in the manifest and returns it.
pub fn move_to_trash(
    workspace: &Path,
    target: &Path,
    entry_type: &str,
) -> Result<TrashEntry, String> {
    let trash = trash_dir(workspace);
    fs::create_dir_all(&trash).map_err(|e| format!("Failed to create .trash directory: {}", e))?;

    let original_name = target
        .file_name()
        .ok_or_else(|| "Target has no file name".to_string())?
        .to_string_lossy()
        .to_string();

    let relative_path = target
        .strip_prefix(workspace)
        .map(|p| p.to_string_lossy().to_string())
        .unwrap_or_else(|_| original_name.clone());

    // Generate a unique ID based on the current timestamp.
    let base_id = Utc::now().timestamp_millis().to_string();
    let mut id = base_id.clone();
    let mut suffix = 1u32;

    // Read existing manifest to check for ID collisions.
    let mut entries = read_manifest(workspace)?;
    while entries.iter().any(|e| e.id == id) {
        id = format!("{}_{}", base_id, suffix);
        suffix += 1;
    }

    // Determine a unique trashed_name inside .trash/ to avoid filesystem collisions.
    let mut trashed_name = original_name.clone();
    let mut counter = 1u32;
    while trash.join(&trashed_name).exists() {
        let stem = Path::new(&original_name)
            .file_stem()
            .unwrap_or_default()
            .to_string_lossy();
        let ext = Path::new(&original_name)
            .extension()
            .map(|e| format!(".{}", e.to_string_lossy()))
            .unwrap_or_default();
        trashed_name = format!("{}_{}{}", stem, counter, ext);
        counter += 1;
    }

    let dest = trash.join(&trashed_name);
    fs::rename(target, &dest)
        .map_err(|e| format!("Failed to move '{}' to trash: {}", target.display(), e))?;

    let entry = TrashEntry {
        id,
        original_name,
        original_path: target.to_string_lossy().to_string(),
        relative_path,
        trashed_name,
        trashed_at: Utc::now().to_rfc3339(),
        entry_type: entry_type.to_string(),
    };

    entries.push(entry.clone());
    write_manifest(workspace, &entries)?;

    Ok(entry)
}

/// Restore a trashed item back to its original location.
///
/// - Recreates parent directories if they no longer exist.
/// - Removes the entry from the manifest.
/// - Returns the original path.
pub fn restore_item(workspace: &Path, trash_id: &str) -> Result<String, String> {
    let mut entries = read_manifest(workspace)?;
    let pos = entries
        .iter()
        .position(|e| e.id == trash_id)
        .ok_or_else(|| format!("Trash entry '{}' not found", trash_id))?;

    let entry = entries.remove(pos);
    let src = trash_dir(workspace).join(&entry.trashed_name);
    let dest = Path::new(&entry.original_path);

    // Recreate parent directories if needed.
    if let Some(parent) = dest.parent() {
        fs::create_dir_all(parent).map_err(|e| {
            format!(
                "Failed to create parent directories for '{}': {}",
                dest.display(),
                e
            )
        })?;
    }

    fs::rename(&src, dest).map_err(|e| {
        format!(
            "Failed to restore '{}' to '{}': {}",
            src.display(),
            dest.display(),
            e
        )
    })?;

    write_manifest(workspace, &entries)?;
    Ok(entry.original_path)
}

/// Permanently delete a single item from the trash.
///
/// Removes the file or directory from `.trash/` and removes the manifest entry.
pub fn delete_item(workspace: &Path, trash_id: &str) -> Result<(), String> {
    let mut entries = read_manifest(workspace)?;
    let pos = entries
        .iter()
        .position(|e| e.id == trash_id)
        .ok_or_else(|| format!("Trash entry '{}' not found", trash_id))?;

    let entry = entries.remove(pos);
    let item_path = trash_dir(workspace).join(&entry.trashed_name);

    if item_path.is_dir() {
        fs::remove_dir_all(&item_path).map_err(|e| {
            format!(
                "Failed to permanently delete folder '{}': {}",
                item_path.display(),
                e
            )
        })?;
    } else {
        fs::remove_file(&item_path).map_err(|e| {
            format!(
                "Failed to permanently delete file '{}': {}",
                item_path.display(),
                e
            )
        })?;
    }

    write_manifest(workspace, &entries)?;
    Ok(())
}

/// Empty the entire trash: permanently delete all items and clear the manifest.
pub fn empty_all(workspace: &Path) -> Result<(), String> {
    let trash = trash_dir(workspace);
    if !trash.exists() {
        return Ok(());
    }

    // Delete everything inside .trash/ except the manifest (we'll overwrite it).
    let read_dir =
        fs::read_dir(&trash).map_err(|e| format!("Failed to read .trash directory: {}", e))?;

    for dir_entry in read_dir {
        let dir_entry = dir_entry.map_err(|e| format!("Failed to read .trash entry: {}", e))?;
        let path = dir_entry.path();
        // Skip the manifest file itself; we'll overwrite it below.
        if path
            .file_name()
            .map(|n| n == ".manifest.json")
            .unwrap_or(false)
        {
            continue;
        }
        if path.is_dir() {
            fs::remove_dir_all(&path)
                .map_err(|e| format!("Failed to delete '{}': {}", path.display(), e))?;
        } else {
            fs::remove_file(&path)
                .map_err(|e| format!("Failed to delete '{}': {}", path.display(), e))?;
        }
    }

    // Clear the manifest.
    write_manifest(workspace, &[])?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs::{self, File};
    use std::io::Write;
    use tempfile::tempdir;

    #[test]
    fn test_trash_dir_path() {
        let workspace = Path::new("/workspace");
        assert_eq!(trash_dir(workspace), PathBuf::from("/workspace/.trash"));
    }

    #[test]
    fn test_manifest_path_location() {
        let workspace = Path::new("/workspace");
        assert_eq!(
            manifest_path(workspace),
            PathBuf::from("/workspace/.trash/.manifest.json")
        );
    }

    #[test]
    fn test_read_manifest_empty_when_no_file() {
        let dir = tempdir().unwrap();
        let entries = read_manifest(dir.path()).unwrap();
        assert!(entries.is_empty());
    }

    #[test]
    fn test_write_and_read_manifest_roundtrip() {
        let dir = tempdir().unwrap();
        let trash = trash_dir(dir.path());
        fs::create_dir_all(&trash).unwrap();

        let entries = vec![TrashEntry {
            id: "123".to_string(),
            original_name: "test.md".to_string(),
            original_path: "/workspace/test.md".to_string(),
            relative_path: "test.md".to_string(),
            trashed_name: "test.md".to_string(),
            trashed_at: "2024-01-01T00:00:00Z".to_string(),
            entry_type: "file".to_string(),
        }];

        write_manifest(dir.path(), &entries).unwrap();
        let loaded = read_manifest(dir.path()).unwrap();

        assert_eq!(loaded.len(), 1);
        assert_eq!(loaded[0].id, "123");
        assert_eq!(loaded[0].original_name, "test.md");
    }

    #[test]
    fn test_move_file_to_trash() {
        let dir = tempdir().unwrap();
        let file_path = dir.path().join("note.md");
        let mut f = File::create(&file_path).unwrap();
        write!(f, "content").unwrap();

        let entry = move_to_trash(dir.path(), &file_path, "file").unwrap();

        // Original file should be gone
        assert!(!file_path.exists());
        // File should now exist in .trash/
        assert!(trash_dir(dir.path()).join(&entry.trashed_name).exists());
        // Manifest should have one entry
        let manifest = read_manifest(dir.path()).unwrap();
        assert_eq!(manifest.len(), 1);
        assert_eq!(manifest[0].original_name, "note.md");
        assert_eq!(manifest[0].entry_type, "file");
    }

    #[test]
    fn test_move_folder_to_trash() {
        let dir = tempdir().unwrap();
        let folder_path = dir.path().join("my_folder");
        fs::create_dir(&folder_path).unwrap();
        File::create(folder_path.join("child.md")).unwrap();

        let entry = move_to_trash(dir.path(), &folder_path, "folder").unwrap();

        assert!(!folder_path.exists());
        assert!(trash_dir(dir.path()).join(&entry.trashed_name).is_dir());
        assert_eq!(entry.entry_type, "folder");
    }

    #[test]
    fn test_restore_item_success() {
        let dir = tempdir().unwrap();
        let file_path = dir.path().join("restore_me.md");
        let mut f = File::create(&file_path).unwrap();
        write!(f, "important data").unwrap();

        let entry = move_to_trash(dir.path(), &file_path, "file").unwrap();
        assert!(!file_path.exists());

        let restored_path = restore_item(dir.path(), &entry.id).unwrap();
        assert_eq!(restored_path, file_path.to_string_lossy().to_string());
        assert!(file_path.exists());
        assert_eq!(fs::read_to_string(&file_path).unwrap(), "important data");

        // Manifest should now be empty
        let manifest = read_manifest(dir.path()).unwrap();
        assert!(manifest.is_empty());
    }

    #[test]
    fn test_restore_item_not_found() {
        let dir = tempdir().unwrap();
        let result = restore_item(dir.path(), "nonexistent-id");
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("not found"));
    }

    #[test]
    fn test_delete_item_permanently() {
        let dir = tempdir().unwrap();
        let file_path = dir.path().join("delete_permanently.md");
        let mut f = File::create(&file_path).unwrap();
        write!(f, "gone forever").unwrap();

        let entry = move_to_trash(dir.path(), &file_path, "file").unwrap();
        let trashed_file = trash_dir(dir.path()).join(&entry.trashed_name);
        assert!(trashed_file.exists());

        delete_item(dir.path(), &entry.id).unwrap();
        assert!(!trashed_file.exists());

        let manifest = read_manifest(dir.path()).unwrap();
        assert!(manifest.is_empty());
    }

    #[test]
    fn test_delete_item_not_found() {
        let dir = tempdir().unwrap();
        let result = delete_item(dir.path(), "nonexistent-id");
        assert!(result.is_err());
    }

    #[test]
    fn test_empty_all() {
        let dir = tempdir().unwrap();

        // Create and trash two files
        let file1 = dir.path().join("file1.md");
        let file2 = dir.path().join("file2.md");
        File::create(&file1).unwrap();
        File::create(&file2).unwrap();

        move_to_trash(dir.path(), &file1, "file").unwrap();
        move_to_trash(dir.path(), &file2, "file").unwrap();

        let manifest = read_manifest(dir.path()).unwrap();
        assert_eq!(manifest.len(), 2);

        empty_all(dir.path()).unwrap();

        let manifest = read_manifest(dir.path()).unwrap();
        assert!(manifest.is_empty());

        // Only .manifest.json should remain in .trash/
        let trash_contents: Vec<_> = fs::read_dir(trash_dir(dir.path()))
            .unwrap()
            .filter_map(|e| e.ok())
            .collect();
        assert_eq!(trash_contents.len(), 1);
        assert_eq!(
            trash_contents[0].file_name().to_string_lossy(),
            ".manifest.json"
        );
    }

    #[test]
    fn test_empty_all_noop_when_no_trash() {
        let dir = tempdir().unwrap();
        // Should not error when .trash/ doesn't exist
        let result = empty_all(dir.path());
        assert!(result.is_ok());
    }
}
