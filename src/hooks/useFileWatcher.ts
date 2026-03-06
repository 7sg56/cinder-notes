import { useEffect, useRef, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useWorkspace } from "./useWorkspace";

/**
 * Hook that watches the workspace directory for external file changes
 * (files created, deleted, or renamed outside the app) and automatically
 * refreshes the sidebar file tree.
 */
export function useFileWatcher() {
  const { workspacePath, refreshWorkspace } = useWorkspace();
  const isRefreshing = useRef(false);

  // Keep a stable ref to refreshWorkspace to avoid re-running the effect
  const refreshRef = useRef(refreshWorkspace);
  refreshRef.current = refreshWorkspace;

  const handleChange = useCallback(async () => {
    if (isRefreshing.current) return;
    isRefreshing.current = true;
    try {
      await refreshRef.current();
    } catch (err) {
      console.error("Failed to refresh workspace:", err);
    } finally {
      isRefreshing.current = false;
    }
  }, []);

  useEffect(() => {
    if (!workspacePath) return;

    // Start watching the workspace directory
    invoke("watch_workspace", { path: workspacePath }).catch((err) =>
      console.error("Failed to start file watcher:", err),
    );

    // Listen for change events from the backend
    const unlisten = listen("workspace-changed", handleChange);

    return () => {
      // Clean up: stop watching and remove event listener
      unlisten.then((fn) => fn());
      invoke("unwatch_workspace").catch((err) =>
        console.error("Failed to stop file watcher:", err),
      );
    };
  }, [workspacePath, handleChange]);
}
