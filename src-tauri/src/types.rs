//! Data types used throughout the Cinder backend

use serde::{Deserialize, Serialize};

/// Represents a file or folder entry in the workspace
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileEntry {
    /// Unique identifier (file path)
    pub id: String,
    /// Display name of the file/folder
    pub name: String,
    /// Type: "file" or "folder"
    #[serde(rename = "type")]
    pub entry_type: String,
    /// Full absolute path
    pub path: String,
    /// Child entries (for folders)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub children: Option<Vec<FileEntry>>,
}

impl FileEntry {
    /// Create a new file entry
    pub fn new_file(path: String, name: String) -> Self {
        Self {
            id: path.clone(),
            name,
            entry_type: "file".to_string(),
            path,
            children: None,
        }
    }

    /// Create a new folder entry
    pub fn new_folder(path: String, name: String, children: Vec<FileEntry>) -> Self {
        Self {
            id: path.clone(),
            name,
            entry_type: "folder".to_string(),
            path,
            children: Some(children),
        }
    }
}

/// Error type for workspace operations
#[derive(Debug, Clone, Serialize)]
pub struct WorkspaceError {
    pub message: String,
    pub code: String,
}

impl WorkspaceError {
    pub fn not_found(path: &str) -> Self {
        Self {
            message: format!("Path not found: {}", path),
            code: "NOT_FOUND".to_string(),
        }
    }

    pub fn permission_denied(path: &str) -> Self {
        Self {
            message: format!("Permission denied: {}", path),
            code: "PERMISSION_DENIED".to_string(),
        }
    }

    pub fn io_error(err: std::io::Error) -> Self {
        Self {
            message: err.to_string(),
            code: "IO_ERROR".to_string(),
        }
    }
}
