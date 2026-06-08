//! Workspace scanning and file tree operations

use crate::types::FileEntry;
use std::cmp::Ordering;
use std::fs;
use std::path::Path;
use std::time::SystemTime;

/// Recursively scan a directory and build a file tree
///
/// Only includes `.md` files and folders containing them.
/// Hidden files/folders (starting with `.`) are excluded.
pub fn scan_directory_recursive(path: &Path) -> Result<Vec<FileEntry>, String> {
    let mut entries = Vec::new();

    let read_dir = fs::read_dir(path)
        .map_err(|e| format!("Failed to read directory {}: {}", path.display(), e))?;

    for entry in read_dir {
        let entry = entry.map_err(|e| e.to_string())?;
        let entry_path = entry.path();
        let file_name = entry.file_name().to_string_lossy().to_string();

        // Skip hidden files and directories
        if file_name.starts_with('.') {
            continue;
        }

        let metadata = entry.metadata().map_err(|e| {
            format!(
                "Failed to read metadata for {}: {}",
                entry_path.display(),
                e
            )
        })?;

        let modified_at = metadata.modified().ok().and_then(|t| {
            t.duration_since(SystemTime::UNIX_EPOCH)
                .ok()
                .map(|d| d.as_secs())
        });

        if metadata.is_dir() {
            let children = scan_directory_recursive(&entry_path)?;
            entries.push(FileEntry::new_folder(
                entry_path.to_string_lossy().to_string(),
                file_name,
                children,
                modified_at,
            ));
        } else if file_name.ends_with(".md") {
            entries.push(FileEntry::new_file(
                entry_path.to_string_lossy().to_string(),
                file_name,
                modified_at,
            ));
        }
    }

    // Sort: folders first, then files, alphabetically
    entries.sort_by(|a, b| match (&a.entry_type[..], &b.entry_type[..]) {
        ("folder", "file") => Ordering::Less,
        ("file", "folder") => Ordering::Greater,
        _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
    });

    Ok(entries)
}

/// Validate that a workspace path exists and is a directory
pub fn validate_workspace_path(path: &Path) -> Result<(), String> {
    if !path.exists() {
        return Err(format!("Workspace path does not exist: {}", path.display()));
    }
    if !path.is_dir() {
        return Err(format!(
            "Workspace path is not a directory: {}",
            path.display()
        ));
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs::{self, File};
    use std::io::Write;
    use tempfile::tempdir;

    #[test]
    fn test_scan_empty_directory() {
        let dir = tempdir().unwrap();
        let result = scan_directory_recursive(dir.path()).unwrap();
        assert!(result.is_empty());
    }

    #[test]
    fn test_scan_with_markdown_files() {
        let dir = tempdir().unwrap();

        // Create test files
        let mut file = File::create(dir.path().join("test.md")).unwrap();
        writeln!(file, "# Test").unwrap();

        File::create(dir.path().join("other.txt")).unwrap(); // Should be ignored

        let result = scan_directory_recursive(dir.path()).unwrap();
        assert_eq!(result.len(), 1);
        assert_eq!(result[0].name, "test.md");
    }

    #[test]
    fn test_hidden_files_ignored() {
        let dir = tempdir().unwrap();
        File::create(dir.path().join(".hidden.md")).unwrap();

        let result = scan_directory_recursive(dir.path()).unwrap();
        assert!(result.is_empty());
    }

    #[test]
    fn test_validate_workspace_path_valid() {
        let dir = tempdir().unwrap();
        assert!(validate_workspace_path(dir.path()).is_ok());
    }

    #[test]
    fn test_validate_workspace_path_nonexistent() {
        let result = validate_workspace_path(Path::new("/tmp/nonexistent_cinder_workspace"));
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("does not exist"));
    }

    #[test]
    fn test_validate_workspace_path_is_file() {
        let dir = tempdir().unwrap();
        let file_path = dir.path().join("not_a_dir.txt");
        File::create(&file_path).unwrap();

        let result = validate_workspace_path(&file_path);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("not a directory"));
    }

    #[test]
    fn test_scan_nested_directories() {
        let dir = tempdir().unwrap();
        let sub = dir.path().join("subfolder");
        fs::create_dir(&sub).unwrap();

        let mut f = File::create(sub.join("nested.md")).unwrap();
        writeln!(f, "# Nested").unwrap();

        let result = scan_directory_recursive(dir.path()).unwrap();
        assert_eq!(result.len(), 1);
        assert_eq!(result[0].entry_type, "folder");
        assert_eq!(result[0].name, "subfolder");

        let children = result[0].children.as_ref().unwrap();
        assert_eq!(children.len(), 1);
        assert_eq!(children[0].name, "nested.md");
    }

    #[test]
    fn test_scan_sorts_folders_before_files() {
        let dir = tempdir().unwrap();

        // Create a file that would sort before a folder alphabetically
        File::create(dir.path().join("aaa.md")).unwrap();
        let folder = dir.path().join("zzz_folder");
        fs::create_dir(&folder).unwrap();
        File::create(folder.join("child.md")).unwrap();

        let result = scan_directory_recursive(dir.path()).unwrap();
        assert_eq!(result.len(), 2);
        // Folder should come first regardless of name
        assert_eq!(result[0].entry_type, "folder");
        assert_eq!(result[1].entry_type, "file");
    }

    #[test]
    fn test_scan_sorts_alphabetically_within_type() {
        let dir = tempdir().unwrap();
        File::create(dir.path().join("zebra.md")).unwrap();
        File::create(dir.path().join("alpha.md")).unwrap();
        File::create(dir.path().join("middle.md")).unwrap();

        let result = scan_directory_recursive(dir.path()).unwrap();
        assert_eq!(result.len(), 3);
        assert_eq!(result[0].name, "alpha.md");
        assert_eq!(result[1].name, "middle.md");
        assert_eq!(result[2].name, "zebra.md");
    }

    #[test]
    fn test_scan_hidden_directories_ignored() {
        let dir = tempdir().unwrap();
        let hidden = dir.path().join(".hidden_dir");
        fs::create_dir(&hidden).unwrap();
        File::create(hidden.join("secret.md")).unwrap();

        let result = scan_directory_recursive(dir.path()).unwrap();
        assert!(result.is_empty());
    }

    #[test]
    fn test_scan_non_md_files_ignored() {
        let dir = tempdir().unwrap();
        File::create(dir.path().join("readme.txt")).unwrap();
        File::create(dir.path().join("image.png")).unwrap();
        File::create(dir.path().join("data.json")).unwrap();

        let result = scan_directory_recursive(dir.path()).unwrap();
        assert!(result.is_empty());
    }
}
