//! File system watcher for detecting external changes to workspace files
//!
//! Uses the `notify` crate to watch for file creation, deletion, and rename
//! events in the workspace directory. Emits a debounced "workspace-changed"
//! event to the frontend via Tauri's event system.

use notify::{Event, EventKind, RecommendedWatcher, RecursiveMode, Watcher};
use std::path::Path;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;
use tauri::{AppHandle, Emitter};

/// Holds the active file system watcher.
///
/// Wrapped in a `Mutex` so it can be managed as Tauri application state
/// and accessed from command handlers.
pub struct FileWatcherState {
    watcher: Mutex<Option<RecommendedWatcher>>,
}

impl FileWatcherState {
    pub fn new() -> Self {
        Self {
            watcher: Mutex::new(None),
        }
    }

    /// Start watching a workspace directory for file changes.
    ///
    /// Stops any previously active watcher before starting a new one.
    /// Only reacts to create, remove, and rename events (not content modifications),
    /// since the sidebar only displays the file tree structure.
    ///
    /// Events are debounced: the first event triggers a 300ms delay before
    /// emitting "workspace-changed" to the frontend. Additional events during
    /// the delay are coalesced.
    pub fn watch(&self, path: &str, app_handle: AppHandle) -> Result<(), String> {
        let mut guard = self.watcher.lock().map_err(|e| e.to_string())?;

        // Drop existing watcher
        *guard = None;

        let pending = Arc::new(AtomicBool::new(false));
        let handle = app_handle.clone();
        let pending_clone = pending.clone();

        let mut watcher = notify::recommended_watcher(move |res: Result<Event, notify::Error>| {
            if let Ok(event) = res {
                let is_structural_change = matches!(
                    event.kind,
                    EventKind::Create(_)
                        | EventKind::Remove(_)
                        | EventKind::Modify(notify::event::ModifyKind::Name(_))
                );
                if is_structural_change && !pending_clone.swap(true, Ordering::SeqCst) {
                    let pending_inner = pending_clone.clone();
                    let handle_inner = handle.clone();
                    thread::spawn(move || {
                        thread::sleep(Duration::from_millis(300));
                        pending_inner.store(false, Ordering::SeqCst);
                        let _ = handle_inner.emit("workspace-changed", ());
                    });
                }
            }
        })
        .map_err(|e| format!("Failed to create file watcher: {}", e))?;

        watcher
            .watch(Path::new(path), RecursiveMode::Recursive)
            .map_err(|e| format!("Failed to watch path '{}': {}", path, e))?;

        *guard = Some(watcher);
        Ok(())
    }

    /// Stop the active file system watcher.
    pub fn unwatch(&self) -> Result<(), String> {
        let mut guard = self.watcher.lock().map_err(|e| e.to_string())?;
        *guard = None;
        Ok(())
    }
}
