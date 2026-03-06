/**
 * Global keyboard shortcuts for Cinder Notes.
 *
 * Registers shortcuts at the document level for app-wide actions.
 * Editor-specific shortcuts (Cmd+Z, Cmd+F, etc.) are handled
 * natively by CodeMirror and are NOT duplicated here.
 */

import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

export function useKeyboardShortcuts() {
  const {
    activeFileId,
    activeFileContent,
    updateFileContent,
    createFile,
    closeFile,
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
          if (
            activeFileId &&
            !activeFileId.startsWith('cinder-') &&
            activeFileId !== 'welcome'
          ) {
            // Trigger a save by re-writing current content
            updateFileContent(activeFileId, activeFileContent);
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

        // Cmd+W -- Close current tab
        case 'w': {
          e.preventDefault();
          if (activeFileId) {
            closeFile(activeFileId);
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
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    activeFileId,
    activeFileContent,
    updateFileContent,
    createFile,
    closeFile,
    toggleExplorerCollapsed,
    createFolder,
    isSearchOpen,
    setSearchOpen,
  ]);
}
