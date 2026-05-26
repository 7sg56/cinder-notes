import { useEffect, useState, useRef, useMemo } from 'react';
import './App.css';
import { MainLayout } from './components/layout/MainLayout';
import { FileExplorer } from './components/layout/explorer/FileExplorer';
import { EditorPane } from './components/layout/editor/EditorPane';

import { SearchPanel } from './components/features/SearchPanel';
import { WorkspaceWelcome } from './components/onboarding/WorkspaceWelcome';
import { useAppStore } from './store/useAppStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useFileWatcher } from './hooks/useFileWatcher';
import { useWorkspace } from './hooks/useWorkspace';
import { isTauri } from './util/tauri';
import { listen } from '@tauri-apps/api/event';
import { getCurrentWindow } from '@tauri-apps/api/window';

function App() {
  const workspacePath = useAppStore((state) => state.workspacePath);
  const resetWorkspace = useAppStore((state) => state.resetWorkspace);
  const { loadWorkspace, selectAndLoadWorkspace } = useWorkspace();

  // Keep stable refs for event listeners
  const selectAndLoadWorkspaceRef = useRef(selectAndLoadWorkspace);
  selectAndLoadWorkspaceRef.current = selectAndLoadWorkspace;

  const resetWorkspaceRef = useRef(resetWorkspace);
  resetWorkspaceRef.current = resetWorkspace;

  const loadWorkspaceRef = useRef(loadWorkspace);
  loadWorkspaceRef.current = loadWorkspace;

  // Synchronously retrieve the last opened workspace path from localStorage to avoid hydration race conditions on startup
  const lastWorkspacePath = useMemo(() => {
    try {
      const stored = localStorage.getItem('cinder-app-storage');
      if (stored) {
        const parsed = JSON.parse(stored);
        const recents = parsed.state?.recentWorkspaces;
        if (Array.isArray(recents) && recents.length > 0) {
          return recents[0].path;
        }
      }
    } catch (e) {
      console.error('Failed to parse last workspace from localStorage:', e);
    }
    return null;
  }, []);

  // Determine once whether we should attempt auto-load
  const shouldAutoLoad = useMemo(() => {
    // In non-Tauri environments (like E2E tests), skip auto-load to ensure tests work reliably
    if (!isTauri()) {
      return false;
    }
    return !workspacePath && !!lastWorkspacePath;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastWorkspacePath]);

  const [isAutoLoading, setIsAutoLoading] = useState(shouldAutoLoad);
  const attemptedRef = useRef(false);

  // Register global keyboard shortcuts
  useKeyboardShortcuts();

  // Watch workspace directory for external file changes
  useFileWatcher();

  // Global window drag handler - uses Tauri JS API since CSS app-region
  // doesn't work reliably with transparent overlay windows on macOS
  useEffect(() => {
    if (!isTauri()) return;
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check if click is on a drag region element itself
      const dragRegion = target.closest('[data-tauri-drag-region]');
      if (!dragRegion) return;
      // Don't drag if clicking interactive elements
      const interactive = target.closest(
        'button, input, a, select, textarea, [contenteditable], [data-no-drag]'
      );
      if (interactive) return;
      e.preventDefault();
      getCurrentWindow().startDragging();
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, []);

  // Show the main window once the app is ready
  useEffect(() => {
    if (!isTauri()) return;
    // Show immediately if no auto-load, or after auto-load completes
    if (!isAutoLoading) {
      getCurrentWindow().show().catch(console.error);
    }
  }, [isAutoLoading]);

  // Also show once workspace loads (covers the auto-load success case)
  useEffect(() => {
    if (workspacePath && isTauri()) {
      getCurrentWindow().show().catch(console.error);
    }
  }, [workspacePath]);

  // Auto-reopen last workspace on launch
  useEffect(() => {
    if (attemptedRef.current) return;
    attemptedRef.current = true;

    if (!isTauri()) {
      setIsAutoLoading(false);
      return;
    }

    if (shouldAutoLoad && lastWorkspacePath) {
      loadWorkspace(lastWorkspacePath)
        .catch((err) => {
          console.error('Failed to auto-load workspace:', err);
        })
        .finally(() => {
          setIsAutoLoading(false);
        });
    } else {
      setIsAutoLoading(false);
    }
  }, [shouldAutoLoad, lastWorkspacePath, loadWorkspace]);

  // Listen for native menu bar events
  useEffect(() => {
    if (!isTauri()) return;
    const unlistens: Promise<() => void>[] = [];

    unlistens.push(
      listen('menu-close-workspace', () => {
        resetWorkspaceRef.current();
      })
    );

    unlistens.push(
      listen('menu-open-folder', () => {
        selectAndLoadWorkspaceRef.current();
      })
    );

    return () => {
      unlistens.forEach((unlisten) => {
        unlisten.then((fn) => fn());
      });
    };
  }, []);

  // Show loading state while auto-reopening
  if (isAutoLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: 'transparent',
          color: 'var(--text-tertiary)',
          fontFamily: 'inherit',
          fontSize: '0.875rem',
          letterSpacing: '0.05em',
        }}
      >
        Loading workspace...
      </div>
    );
  }

  // No workspace open -- show inline welcome
  if (!workspacePath) {
    return <WorkspaceWelcome />;
  }

  return (
    <>
      <MainLayout
        sidebarContent={<FileExplorer />}
        editorContent={<EditorPane />}
      />

      <SearchPanel />
    </>
  );
}

export default App;
