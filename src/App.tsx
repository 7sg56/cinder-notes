import { useEffect, useState, useRef, useMemo } from 'react';
import './App.css';
import { MainLayout } from './components/layout/MainLayout';
import { FileExplorer } from './components/layout/explorer/FileExplorer';
import { EditorPane } from './components/layout/editor/EditorPane';
import { FloatingHub } from './components/features/FloatingHub';
import { SearchPanel } from './components/features/SearchPanel';
import { WorkspaceWelcome } from './components/onboarding/WorkspaceWelcome';
import { useAppStore } from './store/useAppStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useFileWatcher } from './hooks/useFileWatcher';
import { useWorkspace } from './hooks/useWorkspace';
import { listen } from '@tauri-apps/api/event';
import { getCurrentWindow } from '@tauri-apps/api/window';

function App() {
  const windowLabel = useMemo(() => getCurrentWindow().label, []);

  const workspacePath = useAppStore((state) => state.workspacePath);
  const { loadWorkspace, changeWorkspace, selectAndLoadWorkspace } =
    useWorkspace();

  // Keep stable refs for event listeners
  const changeWorkspaceRef = useRef(changeWorkspace);
  changeWorkspaceRef.current = changeWorkspace;

  const loadWorkspaceRef = useRef(loadWorkspace);
  loadWorkspaceRef.current = loadWorkspace;

  const selectAndLoadWorkspaceRef = useRef(selectAndLoadWorkspace);
  selectAndLoadWorkspaceRef.current = selectAndLoadWorkspace;

  // Synchronously retrieve the last opened workspace path from localStorage to avoid hydration race conditions on startup
  const lastWorkspacePath = useMemo(() => {
    if (windowLabel !== 'main') return null;
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
  }, [windowLabel]);

  // Determine once whether we should attempt auto-load (only in main window)
  const shouldAutoLoad = useMemo(() => {
    return windowLabel === 'main' && !workspacePath && !!lastWorkspacePath;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [windowLabel, lastWorkspacePath]);

  const [isAutoLoading, setIsAutoLoading] = useState(shouldAutoLoad);
  const attemptedRef = useRef(false);

  // Register global keyboard shortcuts
  useKeyboardShortcuts();

  // Watch workspace directory for external file changes
  useFileWatcher();

  // Show the main window once a workspace is successfully loaded
  useEffect(() => {
    if (windowLabel === 'main' && workspacePath) {
      getCurrentWindow().show().catch(console.error);
    }
  }, [windowLabel, workspacePath]);

  // Auto-reopen last workspace on launch
  useEffect(() => {
    if (attemptedRef.current) return;
    attemptedRef.current = true;

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
    if (windowLabel !== 'main') return;

    const unlistens: Promise<() => void>[] = [];

    unlistens.push(
      listen('menu-change-workspace', () => {
        changeWorkspaceRef.current();
      })
    );

    unlistens.push(
      listen('menu-close-workspace', () => {
        const { resetWorkspace } = useAppStore.getState();
        resetWorkspace();
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
  }, [windowLabel]);

  // Listen for cross-window load requests (from onboarding window)
  useEffect(() => {
    if (windowLabel !== 'main') return;
    const unlisten = listen<string>('load-workspace-request', (event) => {
      if (event.payload) {
        loadWorkspaceRef.current(event.payload).catch(console.error);
      }
    });
    return () => {
      unlisten.then((fn) => fn());
    };
  }, [windowLabel]);

  // Standalone onboarding window mode
  if (windowLabel === 'onboarding') {
    return <WorkspaceWelcome isStandaloneWindow={true} />;
  }

  // Show loading state while auto-reopening
  if (isAutoLoading && !workspacePath) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: 'var(--bg-primary)',
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

  // Show workspace selection inline if no workspace is set in the main window
  if (!workspacePath) {
    return <WorkspaceWelcome isStandaloneWindow={false} />;
  }

  return (
    <>
      <MainLayout
        sidebarContent={<FileExplorer />}
        editorContent={<EditorPane />}
      />
      <FloatingHub />
      <SearchPanel />
    </>
  );
}

export default App;
