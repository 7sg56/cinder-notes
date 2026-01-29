import { create } from 'zustand';
import type { FileNode } from '../data/mockFileSystem';
import { mockFileSystem } from '../data/mockFileSystem';

interface AppState {
    files: FileNode[];
    activeFileId: string | null;
    openFiles: string[]; // List of file IDs that are open as tabs
    activeFileContent: string;
    isExplorerCollapsed: boolean;
    newTabCounter: number; // Counter for generating unique blank tab IDs

    // Actions
    selectFile: (fileId: string) => void;
    openFileInNewTab: (fileId: string) => void;
    closeFile: (fileId: string) => void;
    updateFileContent: (fileId: string, content: string) => void;
    findFile: (id: string, nodes?: FileNode[]) => FileNode | null;
    getFileBreadcrumb: (fileId: string) => FileNode[];
    toggleExplorerCollapsed: () => void;
    createNewTab: () => void; // Create a new blank tab
}

export const useAppStore = create<AppState>((set, get) => ({
    files: mockFileSystem,
    activeFileId: 'welcome',
    openFiles: ['welcome'],
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
        set((state) => ({
            isExplorerCollapsed: !state.isExplorerCollapsed
        }));
    },

    createNewTab: () => {
        const { openFiles, newTabCounter, activeFileId } = get();
        const newTabId = `new-tab-${newTabCounter}`;

        // If welcome tab is open, replace it
        if (activeFileId === 'welcome') {
            set({
                activeFileId: newTabId,
                openFiles: [newTabId], // Resetting openFiles to just this new one removes welcome
                activeFileContent: '',
                newTabCounter: newTabCounter + 1
            });
        } else {
            set({
                activeFileId: newTabId,
                openFiles: [...openFiles, newTabId],
                activeFileContent: '',
                newTabCounter: newTabCounter + 1
            });
        }
    },
}));
