import { create } from 'zustand';
import type { FileNode } from '../data/mockFileSystem';
import { mockFileSystem } from '../data/mockFileSystem';

interface AppState {
    files: FileNode[];
    activeFileId: string | null;
    openFiles: string[]; // List of file IDs that are open as tabs
    activeFileContent: string;
    isExplorerCollapsed: boolean;

    // Actions
    selectFile: (fileId: string) => void;
    closeFile: (fileId: string) => void;
    updateFileContent: (fileId: string, content: string) => void;
    findFile: (id: string, nodes?: FileNode[]) => FileNode | null;
    toggleExplorerCollapsed: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
    files: mockFileSystem,
    activeFileId: null,
    openFiles: [],
    activeFileContent: '',
    isExplorerCollapsed: false,

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

    selectFile: (fileId: string) => {
        const file = get().findFile(fileId);
        if (file && file.type === 'file') {
            const { openFiles } = get();
            const needsToOpen = !openFiles.includes(fileId);

            set({
                activeFileId: fileId,
                activeFileContent: file.content || '',
                openFiles: needsToOpen ? [...openFiles, fileId] : openFiles
            });
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
        set((state) => ({
            isExplorerCollapsed: !state.isExplorerCollapsed
        }));
    },
}));
