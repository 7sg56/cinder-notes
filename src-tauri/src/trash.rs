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
