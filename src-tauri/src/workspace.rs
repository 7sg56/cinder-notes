//! Workspace scanning and file tree operations

use crate::types::FileEntry;
use std::cmp::Ordering;
use std::fs;
use std::path::Path;

/// Recursively scan a directory and build a file tree
/// 
/// Only includes `.md` files and folders containing them.
/// Hidden files/folders (starting with `.`) are excluded.
pub fn scan_directory_recursive(path: &Path) -> Result<Vec<FileEntry>, String> {
    let mut entries = Vec::new();

    let read_dir = fs::read_dir(path).map_err(|e| {
        format!("Failed to read directory {}: {}", path.display(), e)
    })?;

    for entry in read_dir {
        let entry = entry.map_err(|e| e.to_string())?;
        let entry_path = entry.path();
        let file_name = entry.file_name().to_string_lossy().to_string();

        // Skip hidden files and directories
        if file_name.starts_with('.') {
            continue;
        }

        let metadata = entry.metadata().map_err(|e| {
            format!("Failed to read metadata for {}: {}", entry_path.display(), e)
        })?;

        if metadata.is_dir() {
            let children = scan_directory_recursive(&entry_path)?;
            entries.push(FileEntry::new_folder(
                entry_path.to_string_lossy().to_string(),
                file_name,
                children,
            ));
        } else if file_name.ends_with(".md") {
            entries.push(FileEntry::new_file(
                entry_path.to_string_lossy().to_string(),
                file_name,
            ));
        }
    }

    // Sort: folders first, then files, alphabetically
    entries.sort_by(|a, b| {
        match (&a.entry_type[..], &b.entry_type[..]) {
            ("folder", "file") => Ordering::Less,
            ("file", "folder") => Ordering::Greater,
            _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
        }
    });

    Ok(entries)
}

/// Validate that a workspace path exists and is a directory
pub fn validate_workspace_path(path: &Path) -> Result<(), String> {
    if !path.exists() {
        return Err(format!("Workspace path does not exist: {}", path.display()));
    }
    if !path.is_dir() {
        return Err(format!("Workspace path is not a directory: {}", path.display()));
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
}
