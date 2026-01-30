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
    lastSidebarWidth: number;
    expandedFolderIds: string[]; // List of folder IDs that are expanded

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
    setRenamingFileId: (id: string | null) => void;
    renameFile: (id: string, newName: string) => void;

    // Folder Actions
    toggleFolder: (folderId: string) => void;
    expandFolder: (folderId: string) => void;
    collapseFolder: (folderId: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
    files: mockFileSystem,
    activeFileId: 'welcome',
    openFiles: ['welcome'],
    activeFileContent: '',
    isExplorerCollapsed: false,
    newTabCounter: 0,
    renamingFileId: null,
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
        set((state) => {
            if (state.activeFileId === fileId) {
                return { activeFileContent: content };
            }
            return {};
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
        const { files, openFiles, activeFileId } = get();

        // Find a unique name
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
            content: '',
        };

        // Add to root of file tree (specifically inside the root folder if it exists, otherwise top level)
        // Adjusting logic to add to the first folder found (usually 'root' in mock) or top level
        let newFiles = [...files];
        if (newFiles.length > 0 && newFiles[0].children) {
            newFiles[0].children = [...newFiles[0].children, newFile];
        } else {
            newFiles = [...newFiles, newFile];
        }

        // Logic to replace welcome tab or open new tab
        if (activeFileId === 'welcome') {
            set({
                files: newFiles,
                activeFileId: newFileId,
                openFiles: [newFileId],
                activeFileContent: '',
                renamingFileId: newFileId // Start renaming immediately
            });
        } else {
            set({
                files: newFiles,
                activeFileId: newFileId,
                openFiles: [...openFiles, newFileId],
                activeFileContent: '',
                renamingFileId: newFileId // Start renaming immediately
            });
        }
    },

    setRenamingFileId: (id) => set({ renamingFileId: id }),

    renameFile: (id, newName) => {
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
            renamingFileId: null
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
    }
}));
