/**
 * Global keyboard shortcuts for Cinder Notes.
 *
 * Registers shortcuts at the document level for app-wide actions.
 * Editor-specific shortcuts (Cmd+Z, Cmd+F, etc.) are handled
 * natively by CodeMirror and are NOT duplicated here.
 */

import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useSplitStore } from '../store/useSplitStore';

export function useKeyboardShortcuts() {
  const {
    createFile,
    toggleExplorerCollapsed,
    createFolder,
    isSearchOpen,
    setSearchOpen,
  } = useAppStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;

      if (!isMod) return;

      switch (e.key.toLowerCase()) {
        // Cmd+S -- Force save (prevent browser save dialog)
        case 's': {
          e.preventDefault();
          const splitState = useSplitStore.getState();
          const pane = splitState.panes[splitState.activePaneId];
          const activeFileId = pane?.activeFileId;
          const activeFileContent = pane?.activeFileContent ?? '';
          if (
            activeFileId &&
            !activeFileId.startsWith('cinder-') &&
            activeFileId !== 'welcome'
          ) {
            // Trigger a save by re-writing current content
            splitState.paneUpdateFileContent(
              splitState.activePaneId,
              activeFileId,
              activeFileContent
            );
          }
          break;
        }

        // Cmd+N -- New file
        case 'n': {
          if (e.shiftKey) {
            // Cmd+Shift+N -- New folder
            e.preventDefault();
            createFolder(null);
          } else {
            e.preventDefault();
            createFile();
          }
          break;
        }

        // Cmd+W -- Close current tab in active pane
        case 'w': {
          e.preventDefault();
          const splitState = useSplitStore.getState();
          const pane = splitState.panes[splitState.activePaneId];
          if (pane?.activeFileId) {
            splitState.paneCloseFile(
              splitState.activePaneId,
              pane.activeFileId
            );
          }
          break;
        }

        // Cmd+B -- Toggle sidebar
        case 'b': {
          e.preventDefault();
          toggleExplorerCollapsed();
          break;
        }

        // Cmd+Shift+F -- Global search
        case 'f': {
          if (e.shiftKey) {
            e.preventDefault();
            setSearchOpen(!isSearchOpen);
          }
          // Plain Cmd+F is left to CodeMirror's built-in find/replace
          break;
        }

        // Cmd+\ -- Split right (horizontal)
        case '\\': {
          e.preventDefault();
          const splitState = useSplitStore.getState();
          if (e.shiftKey) {
            // Cmd+Shift+\ -- Split down (vertical)
            splitState.splitPane(splitState.activePaneId, 'vertical');
          } else {
            splitState.splitPane(splitState.activePaneId, 'horizontal');
          }
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    createFile,
    toggleExplorerCollapsed,
    createFolder,
    isSearchOpen,
    setSearchOpen,
  ]);
}
