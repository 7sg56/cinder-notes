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
}

export const useAppStore = create<AppState>((set, get) => ({
    files: mockFileSystem,
    activeFileId: null,
    openFiles: [],
    activeFileContent: '',
    isExplorerCollapsed: false,
    newTabCounter: 0,

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
            set({
                activeFileId: fileId,
                activeFileContent: ''
            });
            return;
        }

        const file = get().findFile(fileId);
        if (file && file.type === 'file') {
            const { openFiles, activeFileId } = get();
            
            // If currently on a blank tab, replace it instead of opening a new tab
            if (activeFileId && activeFileId.startsWith('new-tab-')) {
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
            
            // If currently on a blank tab, replace it instead of opening a new tab
            if (activeFileId && activeFileId.startsWith('new-tab-')) {
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
                // We update openFiles below, so it's fine
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
            // Restore to a large default (50%)
            if (willExpand && newWidth < 20) {
                newWidth = 50;
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
                return { isExplorerCollapsed: isCollapsed, sidebarWidth: 50 };
            }
            return { isExplorerCollapsed: isCollapsed };
        });
    },

    sidebarWidth: 20,
    setSidebarWidth: (width: number) => {
        set({ sidebarWidth: width });
    },

    createNewTab: () => {
        const { openFiles, newTabCounter } = get();
        const newTabId = `new-tab-${newTabCounter}`;

        set({
            activeFileId: newTabId,
            openFiles: [...openFiles, newTabId],
            activeFileContent: '',
            newTabCounter: newTabCounter + 1
        });
    },
}));
