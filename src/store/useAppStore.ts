import { create } from 'zustand';
import type { FileNode } from '../data/mockFileSystem';
import { mockFileSystem } from '../data/mockFileSystem';

interface AppState {
    files: FileNode[];
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
    setRenamingFileId: (id: string | null, source?: 'explorer' | 'editor') => void;
    renameFile: (id: string, newName: string) => void;
    cancelRename: () => void;

    // Folder Actions
    toggleFolder: (folderId: string) => void;
    expandFolder: (folderId: string) => void;
    collapseFolder: (folderId: string) => void;
    moveNode: (sourceId: string, targetFolderId: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
    files: mockFileSystem,
    activeFileId: 'welcome',
    openFiles: ['welcome'],
    activeFileContent: '',
    isExplorerCollapsed: false,
    newTabCounter: 0,
    renamingFileId: null,
    renameSource: null,
    pendingFileId: null,
    lastSidebarWidth: 20,
    expandedFolderIds: [],

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
        // Handle blank tabs
        if (fileId.startsWith('new-tab-')) {
            set((state) => {
                // If currently on welcome page, replace it
                if (state.activeFileId === 'welcome') {
                    return {
                        activeFileId: fileId,
                        activeFileContent: '',
                        openFiles: [fileId] // Replace welcome entirely
                    };
                }
                return {
                    activeFileId: fileId,
                    activeFileContent: ''
                };
            });
            return;
        }

        const file = get().findFile(fileId);
        if (file && file.type === 'file') {
            const { openFiles, activeFileId } = get();

            // If currently on a blank tab OR welcome tab, replace it
            if (activeFileId && (activeFileId.startsWith('new-tab-') || activeFileId === 'welcome')) {
                const newOpenFiles = openFiles.map(id => id === activeFileId ? fileId : id);
                set({
                    activeFileId: fileId,
                    activeFileContent: file.content || '',
                    openFiles: newOpenFiles
                });
            } else {
                // Otherwise, open in new tab if not already open
                const needsToOpen = !openFiles.includes(fileId);
                set({
                    activeFileId: fileId,
                    activeFileContent: file.content || '',
                    openFiles: needsToOpen ? [...openFiles, fileId] : openFiles
                });
            }
        }
    },

    openFileInNewTab: (fileId: string) => {
        const file = get().findFile(fileId);
        if (file && file.type === 'file') {
            const { openFiles, activeFileId } = get();

            // If currently on a blank tab OR welcome tab, replace it
            if (activeFileId && (activeFileId.startsWith('new-tab-') || activeFileId === 'welcome')) {
                const newOpenFiles = openFiles.map(id => id === activeFileId ? fileId : id);
                set({
                    activeFileId: fileId,
                    activeFileContent: file.content || '',
                    openFiles: newOpenFiles
                });
            } else {
                // Otherwise, open in new tab if not already open
                const needsToOpen = !openFiles.includes(fileId);
                set({
                    activeFileId: fileId,
                    activeFileContent: file.content || '',
                    openFiles: needsToOpen ? [...openFiles, fileId] : openFiles
                });
            }
        }
    },

    closeFile: (fileId: string) => {
        const { openFiles, activeFileId } = get();
        const newOpenFiles = openFiles.filter(id => id !== fileId);

        if (activeFileId === fileId) {
            const nextActive = newOpenFiles.length > 0 ? newOpenFiles[newOpenFiles.length - 1] : null;
            if (nextActive) {
                get().selectFile(nextActive);
            } else {
                set({ activeFileId: null, activeFileContent: '' });
                // If we closed the last tab, we might want to show empty state or Welcome?
                // For now, empty state is fine.
            }
        }

        set({ openFiles: newOpenFiles });
    },

    updateFileContent: (fileId: string, content: string) => {
        const state = get();

        // Handle deferred creation for new tabs
        if (fileId.startsWith('new-tab-')) {
            // Only create if we actually have content (though this function is called on change, so probably yes)

            // 1. Generate real file
            const { files, openFiles } = state;

            // Find a unique name (reused logic)
            let nameCounter = 0;
            const baseName = 'untitled';
            const extension = '.md';
            let newName = `${baseName}${extension}`;

            const checkNameExists = (name: string, nodes: FileNode[]): boolean => {
                for (const node of nodes) {
                    if (node.name === name) return true;
                    if (node.children && checkNameExists(name, node.children)) return true;
                }
                return false;
            };

            while (checkNameExists(newName, files)) {
                nameCounter++;
                newName = `${baseName}-${nameCounter}${extension}`;
            }

            const newFileId = `file-${Date.now()}`;
            const newFile: FileNode = {
                id: newFileId,
                name: newName,
                type: 'file',
                content: content, // Save initial content
            };

            // 2. Add to file tree
            let newFiles = [...files];
            if (newFiles.length > 0 && newFiles[0].children) {
                newFiles[0].children = [...newFiles[0].children, newFile];
            } else {
                newFiles = [...newFiles, newFile];
            }

            // 3. Replace deferred ID with real ID
            const newOpenFiles = openFiles.map(id => id === fileId ? newFileId : id);

            set({
                files: newFiles,
                activeFileId: newFileId,
                openFiles: newOpenFiles,
                activeFileContent: content
            });
            return;
        }

        // Normal update - Persist to store AND active state
        set((state) => {
            const updateContentRecursive = (nodes: FileNode[]): FileNode[] => {
                return nodes.map(node => {
                    if (node.id === fileId) {
                        return { ...node, content };
                    }
                    if (node.children) {
                        return { ...node, children: updateContentRecursive(node.children) };
                    }
                    return node;
                });
            };

            return {
                activeFileContent: state.activeFileId === fileId ? content : state.activeFileContent,
                files: updateContentRecursive(state.files)
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
                sidebarWidth: newWidth
            };
        });
    },

    setExplorerCollapsed: (isCollapsed: boolean) => {
        set((state) => {
            // If manual set to expanded, also check width
            if (!isCollapsed && state.sidebarWidth < 20) {
                return { isExplorerCollapsed: isCollapsed, sidebarWidth: state.lastSidebarWidth || 20 };
            }
            return { isExplorerCollapsed: isCollapsed };
        });
    },

    sidebarWidth: 20,
    setSidebarWidth: (width: number) => {
        set((state) => ({
            sidebarWidth: width,
            lastSidebarWidth: width >= 20 ? width : state.lastSidebarWidth
        }));
    },

    createNewTab: () => {
        set((state) => {
            const newCounter = state.newTabCounter + 1;
            const newTabId = `new-tab-${newCounter}`;

            // If currently on welcome, replace it
            if (state.activeFileId === 'welcome') {
                return {
                    newTabCounter: newCounter,
                    activeFileId: newTabId,
                    openFiles: [newTabId],
                    activeFileContent: '',
                    renamingFileId: null, // Don't rename yet
                    renameSource: null
                };
            }

            return {
                newTabCounter: newCounter,
                activeFileId: newTabId,
                openFiles: [...state.openFiles, newTabId],
                activeFileContent: '',
                renamingFileId: newTabId,
                renameSource: 'editor'
            };
        });
    },

    createFile: () => {
        // Creates a file in the root directory directly
        set((state) => {
            const { files, openFiles } = state;

            // Generate unique name
            let nameCounter = 0;
            const baseName = 'New File';
            const extension = '.md';
            let newName = `${baseName}${extension}`;

            const checkNameExists = (name: string, nodes: FileNode[]): boolean => {
                for (const node of nodes) {
                    if (node.name === name) return true;
                    // Only check root level for now as we create in root
                }
                return false;
            };

            while (checkNameExists(newName, files)) {
                nameCounter++;
                newName = `${baseName} ${nameCounter}${extension}`;
            }

            const newFileId = `file-${Date.now()}`;
            const newFile: FileNode = {
                id: newFileId,
                name: newName,
                type: 'file',
                content: '',
            };

            // Add to file tree (root's children)
            // Just append to root files array
            const newFiles = [...files, newFile];

            // Open it
            const newOpenFiles = [...openFiles, newFileId];

            return {
                files: newFiles,
                activeFileId: newFileId,
                openFiles: newOpenFiles,
                activeFileContent: '',
                renamingFileId: newFileId,
                pendingFileId: newFileId, // Mark as pending so cancellation removes it
                renameSource: 'explorer'
            };
        });
    },

    setRenamingFileId: (id, source) => set({ renamingFileId: id, renameSource: source ?? null }),

    cancelRename: () => {
        const { pendingFileId, openFiles, activeFileId, files } = get();

        // If we are cancelling a pending file, remove it
        if (pendingFileId) {
            const removeFile = (nodes: FileNode[]): FileNode[] => {
                return nodes.filter(node => {
                    if (node.id === pendingFileId) return false;
                    if (node.children) {
                        node.children = removeFile(node.children);
                    }
                    return true;
                });
            };

            const newFiles = removeFile(files);
            const newOpenFiles = openFiles.filter(id => id !== pendingFileId);

            // Determine next active file if we are closing the pending one
            let nextActiveId = activeFileId;
            if (activeFileId === pendingFileId) {
                // Determine what to go back to.
                // For now, if no files left, maybe welcome? Or null.
                const lastFile = newOpenFiles.length > 0 ? newOpenFiles[newOpenFiles.length - 1] : null;
                nextActiveId = lastFile || 'welcome';
            }

            set({
                files: newFiles,
                openFiles: newOpenFiles,
                renamingFileId: null,
                renameSource: null,
                pendingFileId: null,
                activeFileId: nextActiveId
            });
        } else {
            // Just stop renaming
            set({ renamingFileId: null, renameSource: null });
        }
    },

    renameFile: (id, newName) => {
        // Handle new tab creation
        if (id.startsWith('new-tab-')) {
            const { files, openFiles } = get();

            // Helper to check for name collisions
            const checkNameExists = (name: string, nodes: FileNode[]): boolean => {
                for (const node of nodes) {
                    if (node.name === name) return true;
                    if (node.children && checkNameExists(name, node.children)) return true;
                }
                return false;
            };

            // Ensure unique name
            let finalName = newName;
            let nameCounter = 0;
            const baseName = newName.replace('.md', '');

            while (checkNameExists(finalName, files)) {
                nameCounter++;
                finalName = `${baseName}-${nameCounter}.md`;
            }

            const newFileId = `file-${Date.now()}`;
            const newFile: FileNode = {
                id: newFileId,
                name: finalName,
                type: 'file',
                content: '',
            };

            // Add to file tree (root's children)
            let newFiles = [...files];
            if (newFiles.length > 0 && newFiles[0].children) {
                newFiles[0].children = [...newFiles[0].children, newFile];
            } else {
                newFiles = [...newFiles, newFile];
            }

            const newOpenFiles = openFiles.map(fid => fid === id ? newFileId : fid);

            set({
                files: newFiles,
                activeFileId: newFileId,
                openFiles: newOpenFiles,
                renamingFileId: null,
                renameSource: null,
                pendingFileId: null
            });
            return;
        }

        const updateName = (nodes: FileNode[]): FileNode[] => {
            return nodes.map(node => {
                if (node.id === id) {
                    return { ...node, name: newName };
                }
                if (node.children) {
                    return { ...node, children: updateName(node.children) };
                }
                return node;
            });
        };

        set(state => ({
            files: updateName(state.files),
            renamingFileId: null,
            renameSource: null,
            pendingFileId: null // Clear pending status on confirmation
        }));
    },

    toggleFolder: (folderId: string) => {
        set((state) => {
            const isExpanded = state.expandedFolderIds.includes(folderId);
            return {
                expandedFolderIds: isExpanded
                    ? state.expandedFolderIds.filter(id => id !== folderId)
                    : [...state.expandedFolderIds, folderId]
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
            expandedFolderIds: state.expandedFolderIds.filter(id => id !== folderId)
        }));
    },

    moveNode: (sourceId: string, targetFolderId: string) => {
        set((state) => {
            // 1. Find and clone the files tree
            const files = [...state.files];

            // Helper to find and remove a node
            let detachedNode: FileNode | null = null;

            const removeNode = (nodes: FileNode[]): FileNode[] => {
                const result: FileNode[] = [];
                for (const node of nodes) {
                    if (node.id === sourceId) {
                        detachedNode = node;
                        continue;
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

            // 2. Validate move (prevent moving folder into self or descendant)
            const isDescendant = (parentId: string, targetId: string, nodes: FileNode[]): boolean => {
                for (const node of nodes) {
                    if (node.id === parentId) {
                        // Check if target is inside this node
                        const checkChildren = (children: FileNode[]): boolean => {
                            for (const child of children) {
                                if (child.id === targetId) return true;
                                if (child.children && checkChildren(child.children)) return true;
                            }
                            return false;
                        };
                        return node.children ? checkChildren(node.children) : false;
                    }
                    if (node.children) {
                        if (isDescendant(parentId, targetId, node.children)) return true;
                    }
                }
                return false;
            };

            // If source is a folder, check if target is inside source
            // But wait, we need to find the source node first to know if it is a folder.
            // Let's do a find first.
            const findNode = (id: string, nodes: FileNode[]): FileNode | null => {
                for (const node of nodes) {
                    if (node.id === id) return node;
                    if (node.children) {
                        const found = findNode(id, node.children);
                        if (found) return found;
                    }
                }
                return null;
            };

            const sourceNode = findNode(sourceId, files);
            if (!sourceNode) return {}; // Source not found

            if (sourceNode.id === targetFolderId) return {}; // Can't move into self

            if (sourceNode.type === 'folder') {
                // Check if target is a descendant of source
                // A simple way is to traverse the sourceNode's children and see if target is there
                const isTargetDescendant = (node: FileNode): boolean => {
                    if (!node.children) return false;
                    for (const child of node.children) {
                        if (child.id === targetFolderId) return true;
                        if (isTargetDescendant(child)) return true;
                    }
                    return false;
                };
                if (isTargetDescendant(sourceNode)) {
                    console.warn('Cannot move folder into its own descendant');
                    return {};
                }
            }

            // 3. Remove node from old location
            const newFilesWithoutSource = removeNode(files);

            if (!detachedNode) return {}; // Should not happen if sourceNode found

            // 4. Add to new location
            const insertNode = (nodes: FileNode[]): FileNode[] => {
                return nodes.map(node => {
                    if (node.id === targetFolderId) {
                        // Check for name collision in target
                        let finalName = detachedNode!.name;
                        let counter = 0;
                        const baseName = finalName.replace(/\.md$/, '');
                        const ext = finalName.endsWith('.md') ? '.md' : '';

                        const exists = (name: string) => node.children?.some(c => c.name === name);

                        while (exists(finalName)) {
                            counter++;
                            finalName = `${baseName} ${counter}${ext}`;
                        }

                        return {
                            ...node,
                            children: node.children ? [...node.children, { ...detachedNode!, name: finalName }] : [{ ...detachedNode!, name: finalName }]
                        };
                    }
                    if (node.children) {
                        return { ...node, children: insertNode(node.children) };
                    }
                    return node;
                });
            };

            // Special case: moving to root
            if (targetFolderId === 'root') {
                // The root folder is usually not in the files array itself if files is struct as content of root
                // Wait, mockFileSystem is `FileNode[]`. 
                // And root is `mockFileSystem[0]`.
                // So if target is 'root', we insert into `mockFileSystem[0].children`.
                // Our recursion handles it if 'root' is one of the nodes.
            }

            const finalFiles = insertNode(newFilesWithoutSource);

            return { files: finalFiles };
        });
    }
}));
