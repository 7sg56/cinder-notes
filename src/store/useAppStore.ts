import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { invoke } from '@tauri-apps/api/core';
import type { FileNode } from '../types/fileSystem';
import type { RecentWorkspace } from '../types/recentWorkspace';
import { joinPath, basename, dirname } from '../utils/pathUtils';
import { getSplitStore, tryGetSplitStore } from './storeBridge';

export interface SearchResult {
  file_path: string;
  file_name: string;
  line_number: number;
  content_preview: string;
}

interface AppState {
  files: FileNode[];
  workspacePath: string | null;
  activeFileId: string | null;
  openFiles: string[]; // List of file IDs that are open as tabs
  activeFileContent: string;
  isExplorerCollapsed: boolean;
  sidebarWidth: number;
  newTabCounter: number; // Counter for generating unique blank tab IDs
  renamingFileId: string | null;
  renameSource: 'explorer' | 'editor' | null;
  lastSidebarWidth: number;
  expandedFolderIds: string[]; // List of folder IDs that are expanded
  pendingFileId: string | null;
  isAutoSave: boolean;
  pinnedFiles: string[];
  recentWorkspaces: RecentWorkspace[];

  // Search State
  isSearchOpen: boolean;
  searchQuery: string;
  searchResults: SearchResult[];

  // Workspace Actions
  setWorkspacePath: (path: string | null) => void;
  setFiles: (files: FileNode[]) => void;

  // Recent Workspaces Actions
  addRecentWorkspace: (path: string) => void;
  removeRecentWorkspace: (path: string) => void;
  clearRecentWorkspaces: () => void;
  resetWorkspace: () => void;

  // Search Actions
  setSearchOpen: (isOpen: boolean) => void;
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: SearchResult[]) => void;

  // Actions
  selectFile: (fileId: string) => void;
  openFileInNewTab: (fileId: string) => void;
  closeFile: (fileId: string) => void;
  updateFileContent: (fileId: string, content: string) => void;
  findFile: (id: string, nodes?: FileNode[]) => FileNode | null;
  getFileBreadcrumb: (fileId: string) => FileNode[];
  toggleExplorerCollapsed: () => void;
  setExplorerCollapsed: (isCollapsed: boolean) => void;
  setSidebarWidth: (width: number) => void;
  createNewTab: () => void; // Create a new blank tab
  createFile: () => void; // Create a new file in root directly
  setRenamingFileId: (
    id: string | null,
    source?: 'explorer' | 'editor'
  ) => void;
  renameFile: (id: string, newName: string) => void;
  cancelRename: () => void;

  // Folder Actions
  toggleFolder: (folderId: string) => void;
  expandFolder: (folderId: string) => void;
  collapseFolder: (folderId: string) => void;
  moveNode: (
    sourceId: string,
    targetId: string,
    position: 'inside' | 'before' | 'after' | 'root'
  ) => void;
  toggleAutoSave: () => void;
  togglePin: (fileId: string) => void;
  openSystemTab: (tabId: string) => void;

  // Context Menu Actions
  deleteFile: (fileId: string) => void;
  deleteFolder: (folderId: string) => void;
  duplicateFile: (fileId: string) => void;
  createFileInFolder: (folderId: string) => void;
  createFolder: (parentFolderId?: string | null) => void;
  closeOtherFiles: (fileId: string) => void;
  closeAllFiles: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      files: [],
      workspacePath: null,
      activeFileId: null,
      openFiles: [],
      activeFileContent: '',
      isExplorerCollapsed: false,
      newTabCounter: 0,
      renamingFileId: null,
      renameSource: null,
      pendingFileId: null,
      lastSidebarWidth: 20,
      expandedFolderIds: [],
      isAutoSave: true,
      pinnedFiles: [],
      recentWorkspaces: [],

      isSearchOpen: false,
      searchQuery: '',
      searchResults: [],

      // Workspace actions
      setWorkspacePath: (path: string | null) => set({ workspacePath: path }),

      addRecentWorkspace: (path: string) => {
        const MAX_RECENT = 3;
        const name = basename(path);
        set((state) => {
          const filtered = state.recentWorkspaces.filter(
            (w) => w.path !== path
          );
          const entry: RecentWorkspace = { path, name, lastOpened: Date.now() };
          return {
            recentWorkspaces: [entry, ...filtered].slice(0, MAX_RECENT),
          };
        });
      },

      removeRecentWorkspace: (path: string) => {
        set((state) => ({
          recentWorkspaces: state.recentWorkspaces.filter(
            (w) => w.path !== path
          ),
        }));
      },

      clearRecentWorkspaces: () => set({ recentWorkspaces: [] }),

      setSearchOpen: (isOpen: boolean) => set({ isSearchOpen: isOpen }),
      setSearchQuery: (query: string) => set({ searchQuery: query }),
      setSearchResults: (results: SearchResult[]) =>
        set({ searchResults: results }),

      setFiles: (files: FileNode[]) =>
        set({
          files,
          activeFileId: null,
          openFiles: [],
          activeFileContent: '',
          expandedFolderIds: [],
        }),

      resetWorkspace: () =>
        set({
          files: [],
          workspacePath: null,
          activeFileId: null,
          openFiles: [],
          activeFileContent: '',
          expandedFolderIds: [],
        }),

      findFile: (id: string, nodes = get().files): FileNode | null => {
        for (const node of nodes) {
          if (node.id === id) return node;
          if (node.children) {
            const found = get().findFile(id, node.children);
            if (found) return found;
          }
        }
        return null;
      },

      getFileBreadcrumb: (fileId: string): FileNode[] => {
        const breadcrumb: FileNode[] = [];

        const traverse = (nodes: FileNode[]): boolean => {
          for (const node of nodes) {
            breadcrumb.push(node);
            if (node.id === fileId) {
              return true;
            }
            if (node.children && traverse(node.children)) {
              return true;
            }
            breadcrumb.pop();
          }
          return false;
        };

        traverse(get().files);
        return breadcrumb;
      },

      selectFile: (fileId: string) => {
        // Delegate to split store - opens file in the active pane
        const splitState = getSplitStore().getState();
        splitState.paneSelectFile(splitState.activePaneId, fileId);
      },

      openSystemTab: (tabId: string) => {
        // Delegate to split store
        const splitState = getSplitStore().getState();
        splitState.paneOpenSystemTab(splitState.activePaneId, tabId);
      },

      toggleAutoSave: () => set((state) => ({ isAutoSave: !state.isAutoSave })),

      togglePin: (fileId: string) =>
        set((state) => {
          const isPinned = state.pinnedFiles.includes(fileId);
          return {
            pinnedFiles: isPinned
              ? state.pinnedFiles.filter((id) => id !== fileId)
              : [...state.pinnedFiles, fileId],
          };
        }),

      openFileInNewTab: (fileId: string) => {
        // Delegate to split store
        const splitState = getSplitStore().getState();
        splitState.paneOpenFileInNewTab(splitState.activePaneId, fileId);
      },

      closeFile: (fileId: string) => {
        // Delegate to split store
        const splitState = getSplitStore().getState();
        splitState.paneCloseFile(splitState.activePaneId, fileId);
      },

      updateFileContent: (fileId: string, content: string) => {
        const state = get();
        const { workspacePath } = state;

        // Handle deferred creation for new tabs
        if (fileId.startsWith('new-tab-')) {
          if (!workspacePath) {
            console.error('No workspace path set');
            return;
          }

          const { files, openFiles } = state;

          // Find a unique name
          let nameCounter = 0;
          const baseName = 'untitled';
          const extension = '.md';
          let newName = `${baseName}${extension}`;

          const checkNameExists = (
            name: string,
            nodes: FileNode[]
          ): boolean => {
            for (const node of nodes) {
              if (node.name === name) return true;
              if (node.children && checkNameExists(name, node.children))
                return true;
            }
            return false;
          };

          while (checkNameExists(newName, files)) {
            nameCounter++;
            newName = `${baseName}-${nameCounter}${extension}`;
          }

          const filePath = joinPath(workspacePath, newName);
          const newFileId = filePath;

          const newFile: FileNode = {
            id: newFileId,
            name: newName,
            type: 'file',
            path: filePath,
            content: content,
          };

          // Create file on disk with content
          invoke('write_note', { path: filePath, content })
            .then(() => console.log('File created on disk:', filePath))
            .catch((err) => console.error('Failed to create file:', err));

          const newFiles = [...files, newFile];
          const newOpenFiles = openFiles.map((id) =>
            id === fileId ? newFileId : id
          );

          set({
            files: newFiles,
            activeFileId: newFileId,
            openFiles: newOpenFiles,
            activeFileContent: content,
          });
          return;
        }

        // Find the file to get its path
        const file = state.findFile(fileId);
        const filePath = file?.path;

        // Write to disk if we have a path
        if (filePath) {
          invoke('write_note', { path: filePath, content })
            .then(() => console.log('File saved:', filePath))
            .catch((err) => console.error('Failed to save file:', err));
        }

        // Normal update - Persist to store AND active state
        set((state) => {
          const updateContentRecursive = (nodes: FileNode[]): FileNode[] => {
            return nodes.map((node) => {
              if (node.id === fileId) {
                return { ...node, content };
              }
              if (node.children) {
                return {
                  ...node,
                  children: updateContentRecursive(node.children),
                };
              }
              return node;
            });
          };

          return {
            activeFileContent:
              state.activeFileId === fileId ? content : state.activeFileContent,
            files: updateContentRecursive(state.files),
          };
        });
      },

      toggleExplorerCollapsed: () => {
        set((state) => {
          const willExpand = state.isExplorerCollapsed;
          let newWidth = state.sidebarWidth;

          // If expanding and current width is too small (e.g. it was dragged to collapse boundary)
          // Restore to last good size
          if (willExpand && newWidth < 20) {
            newWidth = state.lastSidebarWidth || 20;
          }

          return {
            isExplorerCollapsed: !state.isExplorerCollapsed,
            sidebarWidth: newWidth,
          };
        });
      },

      setExplorerCollapsed: (isCollapsed: boolean) => {
        set((state) => {
          // If manual set to expanded, also check width
          if (!isCollapsed && state.sidebarWidth < 20) {
            return {
              isExplorerCollapsed: isCollapsed,
              sidebarWidth: state.lastSidebarWidth || 20,
            };
          }
          return { isExplorerCollapsed: isCollapsed };
        });
      },

      sidebarWidth: 20,
      setSidebarWidth: (width: number) => {
        set((state) => ({
          sidebarWidth: width,
          lastSidebarWidth: width >= 20 ? width : state.lastSidebarWidth,
        }));
      },

      createNewTab: () => {
        // Delegate to split store
        const splitState = getSplitStore().getState();
        splitState.paneCreateNewTab(splitState.activePaneId);
      },

      createFile: () => {
        // Creates file in tree immediately with rename mode active
        // Also creates it on disk immediately
        const state = get();
        const { files, workspacePath } = state;

        if (!workspacePath) {
          console.error('No workspace path set');
          return;
        }

        // Generate unique name
        let nameCounter = 0;
        const baseName = 'New File';
        const extension = '.md';
        let newName = `${baseName}${extension}`;

        const checkNameExists = (name: string, nodes: FileNode[]): boolean => {
          for (const node of nodes) {
            if (node.name === name) return true;
          }
          return false;
        };

        while (checkNameExists(newName, files)) {
          nameCounter++;
          newName = `${baseName} ${nameCounter}${extension}`;
        }

        const filePath = joinPath(workspacePath, newName);
        const newFileId = filePath; // Use path as ID for consistency

        const newFile: FileNode = {
          id: newFileId,
          name: newName,
          type: 'file',
          path: filePath,
          content: '',
        };

        // Create file on disk
        invoke('create_note', { path: filePath })
          .then(() => {
            console.log('File created on disk:', filePath);
          })
          .catch((err) => {
            console.error('Failed to create file on disk:', err);
          });

        // Add to file tree at root level
        const newFiles = [...files, newFile];

        set({
          files: newFiles,
          renamingFileId: newFileId,
          pendingFileId: newFileId, // If cancelled, remove it
          renameSource: 'explorer',
        });

        // Open in the active pane via split store
        const splitState = getSplitStore().getState();
        splitState.paneSelectFile(splitState.activePaneId, newFileId);
      },

      setRenamingFileId: (id, source) =>
        set({ renamingFileId: id, renameSource: source ?? null }),

      cancelRename: () => {
        const { pendingFileId, openFiles, activeFileId, files, findFile } =
          get();

        // If we are cancelling a pending file, remove it
        if (pendingFileId) {
          // Get the file path to delete from disk
          const file = findFile(pendingFileId);
          const filePath = file?.path;

          // Delete from disk if it exists
          if (filePath) {
            invoke('delete_note', {
              path: filePath,
              workspacePath: get().workspacePath,
            })
              .then(() =>
                console.log('Pending file deleted from disk:', filePath)
              )
              .catch((err) =>
                console.error('Failed to delete pending file:', err)
              );
          }

          const removeFile = (nodes: FileNode[]): FileNode[] => {
            return nodes.filter((node) => {
              if (node.id === pendingFileId) return false;
              if (node.children) {
                node.children = removeFile(node.children);
              }
              return true;
            });
          };

          const newFiles = removeFile(files);
          const newOpenFiles = openFiles.filter((id) => id !== pendingFileId);

          // Determine next active file if we are closing the pending one
          let nextActiveId = activeFileId;
          if (activeFileId === pendingFileId) {
            const lastFile =
              newOpenFiles.length > 0
                ? newOpenFiles[newOpenFiles.length - 1]
                : null;
            nextActiveId = lastFile || null;
          }

          set({
            files: newFiles,
            openFiles: newOpenFiles,
            renamingFileId: null,
            renameSource: null,
            pendingFileId: null,
            activeFileId: nextActiveId,
          });
        } else {
          // Just stop renaming
          set({ renamingFileId: null, renameSource: null });
        }
      },

      renameFile: (id, newName) => {
        const state = get();
        const { workspacePath } = state;

        // Handle new tab creation (deferred file creation)
        if (id.startsWith('new-tab-')) {
          if (!workspacePath) {
            console.error('No workspace path set');
            return;
          }

          const { files, openFiles } = state;

          // Helper to check for name collisions
          const checkNameExists = (
            name: string,
            nodes: FileNode[]
          ): boolean => {
            for (const node of nodes) {
              if (node.name === name) return true;
              if (node.children && checkNameExists(name, node.children))
                return true;
            }
            return false;
          };

          // Ensure unique name
          let finalName = newName;
          if (!finalName.endsWith('.md')) finalName += '.md';
          let nameCounter = 0;
          const baseName = finalName.replace('.md', '');

          while (checkNameExists(finalName, files)) {
            nameCounter++;
            finalName = `${baseName}-${nameCounter}.md`;
          }

          const filePath = joinPath(workspacePath, finalName);
          const newFileId = filePath;

          const newFile: FileNode = {
            id: newFileId,
            name: finalName,
            type: 'file',
            path: filePath,
            content: '',
          };

          // Create file on disk
          invoke('create_note', { path: filePath })
            .then(() => console.log('File created on disk:', filePath))
            .catch((err) => console.error('Failed to create file:', err));

          const newFiles = [...files, newFile];
          const newOpenFiles = openFiles.map((fid) =>
            fid === id ? newFileId : fid
          );

          set({
            files: newFiles,
            activeFileId: newFileId,
            openFiles: newOpenFiles,
            renamingFileId: null,
            renameSource: null,
            pendingFileId: null,
          });

          // Sync the new file ID to the active pane in split store
          const splitState = getSplitStore().getState();
          const activePaneId = splitState.activePaneId;
          const pane = splitState.panes[activePaneId];
          if (pane && pane.activeFileId === id) {
            const updatedPanes = { ...splitState.panes };
            updatedPanes[activePaneId] = {
              ...pane,
              activeFileId: newFileId,
              openFiles: pane.openFiles.map((fid: string) =>
                fid === id ? newFileId : fid
              ),
            };
            getSplitStore().setState({ panes: updatedPanes });
          }
          return;
        }

        // Find existing file to get its path
        const file = state.findFile(id);
        const oldPath = file?.path;

        if (!oldPath) {
          // Legacy in-memory rename (no path)
          const updateName = (nodes: FileNode[]): FileNode[] => {
            return nodes.map((node) => {
              if (node.id === id) {
                return { ...node, name: newName };
              }
              if (node.children) {
                return { ...node, children: updateName(node.children) };
              }
              return node;
            });
          };

          set((state) => ({
            files: updateName(state.files),
            renamingFileId: null,
            renameSource: null,
            pendingFileId: null,
          }));
          return;
        }

        // Calculate new path
        const dir = dirname(oldPath);
        let finalName = newName;
        if (!finalName.endsWith('.md')) finalName += '.md';
        const newPath = joinPath(dir, finalName);

        // Rename on disk
        invoke('rename_note', { oldPath, newPath })
          .then(() => console.log('File renamed on disk:', newPath))
          .catch((err) => console.error('Failed to rename file:', err));

        // Update state with new path and id
        const updateFileData = (nodes: FileNode[]): FileNode[] => {
          return nodes.map((node) => {
            if (node.id === id) {
              return {
                ...node,
                id: newPath,
                name: finalName,
                path: newPath,
              };
            }
            if (node.children) {
              return { ...node, children: updateFileData(node.children) };
            }
            return node;
          });
        };

        const { openFiles, activeFileId } = state;
        const newOpenFiles = openFiles.map((fid) =>
          fid === id ? newPath : fid
        );
        const newActiveId = activeFileId === id ? newPath : activeFileId;

        set({
          files: updateFileData(state.files),
          openFiles: newOpenFiles,
          activeFileId: newActiveId,
          renamingFileId: null,
          renameSource: null,
          pendingFileId: null,
        });
      },

      toggleFolder: (folderId: string) => {
        set((state) => {
          const isExpanded = state.expandedFolderIds.includes(folderId);
          return {
            expandedFolderIds: isExpanded
              ? state.expandedFolderIds.filter((id) => id !== folderId)
              : [...state.expandedFolderIds, folderId],
          };
        });
      },

      expandFolder: (folderId: string) => {
        set((state) => {
          if (state.expandedFolderIds.includes(folderId)) return {};
          return { expandedFolderIds: [...state.expandedFolderIds, folderId] };
        });
      },

      collapseFolder: (folderId: string) => {
        set((state) => ({
          expandedFolderIds: state.expandedFolderIds.filter(
            (id) => id !== folderId
          ),
        }));
      },

      moveNode: (
        sourceId: string,
        targetId: string,
        position: 'inside' | 'before' | 'after' | 'root'
      ) => {
        set((state) => {
          const files = [...state.files];

          // 1. Find and Remove Source
          let detachedNode: FileNode | null = null;

          const removeNode = (nodes: FileNode[]): FileNode[] => {
            const result: FileNode[] = [];
            for (const node of nodes) {
              if (node.id === sourceId) {
                detachedNode = node;
                continue; // Remove it
              }
              if (node.children) {
                const newChildren = removeNode(node.children);
                if (node.children !== newChildren) {
                  result.push({ ...node, children: newChildren });
                } else {
                  result.push(node);
                }
              } else {
                result.push(node);
              }
            }
            return result;
          };

          const newFilesWithoutSource = removeNode(files);

          if (!detachedNode) {
            return {};
          }

          // 2. Validate Target & Insert
          if (targetId === 'root') {
            return { files: [...newFilesWithoutSource, detachedNode!] };
          }

          let inserted = false;

          // We need a pass to insert, then maybe a pass to fix names?
          // Merging insertion and name fix is tricky with immutable recursive structure.
          // Let's rely on `insertNode` for structural change.
          // Warning: `insertNode` as written above for 'before/after' returns a flattened list for that level.
          // But we need to update `newFilesWithoutSource` recursively.

          // Re-write insertion to be cleaner
          const insertRecursive = (list: FileNode[]): FileNode[] => {
            const newList: FileNode[] = [];

            for (const node of list) {
              if (node.id === targetId) {
                inserted = true;
                // Prepare node to insert (detachedNode)
                // We don't check name collision here optimally but let's assume UI handles it or we fix it later
                // For now, inserted node gets raw name.

                if (position === 'before') {
                  newList.push(detachedNode!);
                  newList.push(node);
                } else if (position === 'after') {
                  newList.push(node);
                  newList.push(detachedNode!);
                } else if (position === 'inside') {
                  const children = node.children || [];
                  const newChildren = [...children, detachedNode!];
                  newList.push({ ...node, children: newChildren });
                }
              } else {
                if (node.children) {
                  const newChildren = insertRecursive(node.children);
                  if (newChildren !== node.children) {
                    newList.push({ ...node, children: newChildren });
                  } else {
                    newList.push(node);
                  }
                } else {
                  newList.push(node);
                }
              }
            }
            return newList;
          };

          const finalFiles = insertRecursive(newFilesWithoutSource);

          if (!inserted) {
            return {}; // Return nothing to keep original state
          }

          return { files: finalFiles };
        });
      },

      // --- Context Menu Actions ---

      deleteFile: (fileId: string) => {
        const state = get();
        const file = state.findFile(fileId);
        const filePath = file?.path;

        // Delete from disk
        if (filePath) {
          invoke('delete_note', {
            path: filePath,
            workspacePath: state.workspacePath,
          })
            .then(() => console.log('File deleted from disk:', filePath))
            .catch((err) => console.error('Failed to delete file:', err));
        }

        // Remove from file tree
        const removeFromTree = (nodes: FileNode[]): FileNode[] => {
          return nodes
            .filter((node) => {
              if (node.id === fileId) return false;
              if (node.children) {
                node = { ...node, children: removeFromTree(node.children) };
              }
              return true;
            })
            .map((node) => {
              if (node.children) {
                return { ...node, children: removeFromTree(node.children) };
              }
              return node;
            });
        };

        const newFiles = removeFromTree(state.files);
        const newOpenFiles = state.openFiles.filter((id) => id !== fileId);

        // Determine next active file
        let nextActiveId = state.activeFileId;
        if (state.activeFileId === fileId) {
          nextActiveId =
            newOpenFiles.length > 0
              ? newOpenFiles[newOpenFiles.length - 1]
              : null;
        }

        set({
          files: newFiles,
          openFiles: newOpenFiles,
          activeFileId: nextActiveId,
          activeFileContent:
            nextActiveId === state.activeFileId ? state.activeFileContent : '',
        });

        // Close the deleted file from all panes in the split store
        const splitState = getSplitStore().getState();
        const updatedPanes = { ...splitState.panes };
        let needsUpdate = false;
        for (const [paneId, pane] of Object.entries(splitState.panes)) {
          const paneState = pane as {
            activeFileId: string | null;
            openFiles: string[];
            activeFileContent: string;
          };
          if (paneState.openFiles.includes(fileId)) {
            needsUpdate = true;
            const newPaneOpenFiles = paneState.openFiles.filter(
              (id: string) => id !== fileId
            );
            if (paneState.activeFileId === fileId) {
              const nextPaneActive =
                newPaneOpenFiles.length > 0
                  ? newPaneOpenFiles[newPaneOpenFiles.length - 1]
                  : null;
              updatedPanes[paneId] = {
                ...paneState,
                openFiles: newPaneOpenFiles,
                activeFileId: nextPaneActive,
                activeFileContent: '',
              };
              // Load content for next file
              if (nextPaneActive) {
                setTimeout(() => {
                  getSplitStore()
                    .getState()
                    .paneSelectFile(paneId, nextPaneActive);
                }, 0);
              }
            } else {
              updatedPanes[paneId] = {
                ...paneState,
                openFiles: newPaneOpenFiles,
              };
            }
          }
        }
        if (needsUpdate) {
          getSplitStore().setState({ panes: updatedPanes });
        }
      },

      deleteFolder: (folderId: string) => {
        const state = get();
        const folder = state.findFile(folderId);
        const folderPath = folder?.path;

        // Delete from disk
        if (folderPath) {
          invoke('delete_folder', {
            path: folderPath,
            workspacePath: state.workspacePath,
          })
            .then(() => console.log('Folder deleted from disk:', folderPath))
            .catch((err) => console.error('Failed to delete folder:', err));
        }

        // Collect all file IDs inside the folder (to close their tabs)
        const collectFileIds = (node: FileNode): string[] => {
          const ids: string[] = [node.id];
          if (node.children) {
            for (const child of node.children) {
              ids.push(...collectFileIds(child));
            }
          }
          return ids;
        };

        const idsToRemove = folder ? collectFileIds(folder) : [folderId];

        // Remove from file tree
        const removeFromTree = (nodes: FileNode[]): FileNode[] => {
          return nodes
            .filter((node) => node.id !== folderId)
            .map((node) => {
              if (node.children) {
                return { ...node, children: removeFromTree(node.children) };
              }
              return node;
            });
        };

        const newFiles = removeFromTree(state.files);
        const newOpenFiles = state.openFiles.filter(
          (id) => !idsToRemove.includes(id)
        );
        const newExpandedFolderIds = state.expandedFolderIds.filter(
          (id) => !idsToRemove.includes(id)
        );

        let nextActiveId = state.activeFileId;
        if (state.activeFileId && idsToRemove.includes(state.activeFileId)) {
          nextActiveId =
            newOpenFiles.length > 0
              ? newOpenFiles[newOpenFiles.length - 1]
              : null;
        }

        set({
          files: newFiles,
          openFiles: newOpenFiles,
          expandedFolderIds: newExpandedFolderIds,
          activeFileId: nextActiveId,
          activeFileContent: '',
        });

        if (nextActiveId && nextActiveId !== state.activeFileId) {
          get().selectFile(nextActiveId);
        }
      },

      duplicateFile: (fileId: string) => {
        const state = get();
        const file = state.findFile(fileId);
        if (!file || !file.path) return;

        const dir = dirname(file.path);
        const baseName = file.name.replace(/\.md$/, '');
        const extension = '.md';

        // Find unique name
        let copyName = `${baseName} (copy)${extension}`;
        let counter = 1;

        const checkNameExists = (name: string, nodes: FileNode[]): boolean => {
          for (const node of nodes) {
            if (node.name === name) return true;
            if (node.children && checkNameExists(name, node.children))
              return true;
          }
          return false;
        };

        while (checkNameExists(copyName, state.files)) {
          counter++;
          copyName = `${baseName} (copy ${counter})${extension}`;
        }

        const copyPath = joinPath(dir, copyName);
        const copyId = copyPath;

        // Read original content then write the copy
        invoke<string>('read_note', { path: file.path })
          .then((content) => {
            return invoke('write_note', { path: copyPath, content });
          })
          .then(() => {
            const newFile: FileNode = {
              id: copyId,
              name: copyName,
              type: 'file',
              path: copyPath,
              content: '',
            };

            // Insert copy next to the original in the tree
            const insertCopy = (nodes: FileNode[]): FileNode[] => {
              const result: FileNode[] = [];
              for (const node of nodes) {
                result.push(node);
                if (node.id === fileId) {
                  result.push(newFile);
                }
                if (node.children) {
                  const updatedNode = {
                    ...result[result.length - 1],
                    children: insertCopy(node.children),
                  };
                  result[result.length - 1] = updatedNode;
                }
              }
              return result;
            };

            set((state) => ({
              files: insertCopy(state.files),
            }));
          })
          .catch((err) => console.error('Failed to duplicate file:', err));
      },

      createFileInFolder: (folderId: string) => {
        const state = get();
        const { files, workspacePath } = state;
        const folder = state.findFile(folderId);

        if (!workspacePath || !folder || !folder.path) {
          console.error('No workspace or folder path');
          return;
        }

        // Generate unique name within the folder
        let nameCounter = 0;
        const baseName = 'New File';
        const extension = '.md';
        let newName = `${baseName}${extension}`;

        const siblings = folder.children || [];
        const checkNameExists = (name: string): boolean => {
          return siblings.some((node) => node.name === name);
        };

        while (checkNameExists(newName)) {
          nameCounter++;
          newName = `${baseName} ${nameCounter}${extension}`;
        }

        const filePath = joinPath(folder.path, newName);
        const newFileId = filePath;

        const newFile: FileNode = {
          id: newFileId,
          name: newName,
          type: 'file',
          path: filePath,
          content: '',
        };

        // Create on disk
        invoke('create_note', { path: filePath })
          .then(() => console.log('File created inside folder:', filePath))
          .catch((err) =>
            console.error('Failed to create file in folder:', err)
          );

        // Add to the folder's children in the tree
        const addToFolder = (nodes: FileNode[]): FileNode[] => {
          return nodes.map((node) => {
            if (node.id === folderId) {
              return { ...node, children: [...(node.children || []), newFile] };
            }
            if (node.children) {
              return { ...node, children: addToFolder(node.children) };
            }
            return node;
          });
        };

        // Expand the folder so the new file is visible
        const newExpandedFolderIds = state.expandedFolderIds.includes(folderId)
          ? state.expandedFolderIds
          : [...state.expandedFolderIds, folderId];

        set({
          files: addToFolder(files),
          renamingFileId: newFileId,
          pendingFileId: newFileId,
          renameSource: 'explorer',
          expandedFolderIds: newExpandedFolderIds,
        });

        // Open in the active pane via split store
        const splitState = getSplitStore().getState();
        splitState.paneSelectFile(splitState.activePaneId, newFileId);
      },

      createFolder: (parentFolderId?: string | null) => {
        const state = get();
        const { files, workspacePath } = state;

        if (!workspacePath) {
          console.error('No workspace path set');
          return;
        }

        let parentPath = workspacePath;
        let siblings = files;

        if (parentFolderId) {
          const parent = state.findFile(parentFolderId);
          if (parent && parent.path) {
            parentPath = parent.path;
            siblings = parent.children || [];
          }
        }

        // Generate unique folder name
        let nameCounter = 0;
        const baseName = 'New Folder';
        let newName = baseName;

        const checkNameExists = (name: string): boolean => {
          return siblings.some((node) => node.name === name);
        };

        while (checkNameExists(newName)) {
          nameCounter++;
          newName = `${baseName} ${nameCounter}`;
        }

        const folderPath = joinPath(parentPath, newName);
        const folderId = folderPath;

        const newFolder: FileNode = {
          id: folderId,
          name: newName,
          type: 'folder',
          path: folderPath,
          children: [],
        };

        // Create on disk
        invoke('create_folder', { path: folderPath })
          .then(() => console.log('Folder created on disk:', folderPath))
          .catch((err) => console.error('Failed to create folder:', err));

        if (parentFolderId) {
          // Add inside parent
          const addToParent = (nodes: FileNode[]): FileNode[] => {
            return nodes.map((node) => {
              if (node.id === parentFolderId) {
                return {
                  ...node,
                  children: [...(node.children || []), newFolder],
                };
              }
              if (node.children) {
                return { ...node, children: addToParent(node.children) };
              }
              return node;
            });
          };

          const newExpandedFolderIds = state.expandedFolderIds.includes(
            parentFolderId
          )
            ? state.expandedFolderIds
            : [...state.expandedFolderIds, parentFolderId];

          set({
            files: addToParent(files),
            expandedFolderIds: [...newExpandedFolderIds, folderId],
          });
        } else {
          // Add at root
          set({
            files: [...files, newFolder],
            expandedFolderIds: [...state.expandedFolderIds, folderId],
          });
        }
      },

      closeOtherFiles: (fileId: string) => {
        // Delegate to split store
        const splitState = getSplitStore().getState();
        splitState.paneCloseOtherFiles(splitState.activePaneId, fileId);
      },

      closeAllFiles: () => {
        // Delegate to split store
        const splitState = getSplitStore().getState();
        splitState.paneCloseAllFiles(splitState.activePaneId);
      },
    }),
    {
      name: 'cinder-app-storage',
      partialize: (state) => ({
        isAutoSave: state.isAutoSave,
        pinnedFiles: state.pinnedFiles,
        recentWorkspaces: state.recentWorkspaces,
      }),
    }
  )
);

// ─── Sync activeFileId from useSplitStore for backward compatibility ────────
// Components like FileTreeItem read activeFileId from useAppStore to highlight
// the active file in the sidebar. This subscription keeps it in sync.
setTimeout(() => {
  const store = tryGetSplitStore();
  if (!store) return;
  store.subscribe(
    (state: {
      activePaneId: string;
      panes: Record<string, { activeFileId: string | null }>;
    }) => {
      const pane = state.panes[state.activePaneId];
      const splitActiveFileId = pane?.activeFileId ?? null;
      const appActiveFileId = useAppStore.getState().activeFileId;
      if (splitActiveFileId !== appActiveFileId) {
        useAppStore.setState({ activeFileId: splitActiveFileId });
      }
    }
  );
}, 0);
