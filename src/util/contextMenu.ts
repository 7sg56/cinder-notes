/**
 * Native context menu builders using Tauri v2 Menu API.
 *
 * Each function constructs a native OS menu and pops it up at the cursor.
 * The menus are built on-demand and disposed after use.
 */

import { Menu, MenuItem, PredefinedMenuItem } from '@tauri-apps/api/menu';
import type { FileNode } from '../data/mockFileSystem';

// ── Types ────────────────────────────────────────────────────────────────────

type StoreActions = {
    openFileInNewTab: (fileId: string) => void;
    selectFile: (fileId: string) => void;
    setRenamingFileId: (id: string | null, source?: 'explorer' | 'editor') => void;
    deleteFile: (fileId: string) => void;
    deleteFolder: (folderId: string) => void;
    duplicateFile: (fileId: string) => void;
    createFile: () => void;
    createFileInFolder: (folderId: string) => void;
    createFolder: (parentFolderId?: string | null) => void;
    closeFile: (fileId: string) => void;
    closeOtherFiles: (fileId: string) => void;
    closeAllFiles: () => void;
    findFile: (id: string) => FileNode | null;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

async function sep() {
    return await PredefinedMenuItem.new({ item: 'Separator' });
}

async function copyPathToClipboard(path: string) {
    try {
        await navigator.clipboard.writeText(path);
    } catch (err) {
        console.error('Failed to copy path:', err);
    }
}

// ── Sidebar: File Context Menu ───────────────────────────────────────────────

export async function showFileContextMenu(node: FileNode, actions: StoreActions) {
    const menu = await Menu.new({
        items: [
            await MenuItem.new({
                id: 'open',
                text: 'Open',
                action: () => actions.openFileInNewTab(node.id),
            }),
            await sep(),
            await MenuItem.new({
                id: 'rename',
                text: 'Rename',
                action: () => actions.setRenamingFileId(node.id, 'explorer'),
            }),
            await MenuItem.new({
                id: 'duplicate',
                text: 'Duplicate',
                action: () => actions.duplicateFile(node.id),
            }),
            await MenuItem.new({
                id: 'copy-path',
                text: 'Copy Path',
                action: () => {
                    if (node.path) copyPathToClipboard(node.path);
                },
            }),
            await sep(),
            await MenuItem.new({
                id: 'delete',
                text: 'Move to Trash',
                action: () => actions.deleteFile(node.id),
            }),
        ],
    });

    await menu.popup();
}

// ── Sidebar: Folder Context Menu ─────────────────────────────────────────────

export async function showFolderContextMenu(node: FileNode, actions: StoreActions) {
    const menu = await Menu.new({
        items: [
            await MenuItem.new({
                id: 'new-note',
                text: 'New Note',
                action: () => actions.createFileInFolder(node.id),
            }),
            await MenuItem.new({
                id: 'new-folder',
                text: 'New Folder',
                action: () => actions.createFolder(node.id),
            }),
            await sep(),
            await MenuItem.new({
                id: 'rename',
                text: 'Rename',
                action: () => actions.setRenamingFileId(node.id, 'explorer'),
            }),
            await MenuItem.new({
                id: 'copy-path',
                text: 'Copy Path',
                action: () => {
                    if (node.path) copyPathToClipboard(node.path);
                },
            }),
            await sep(),
            await MenuItem.new({
                id: 'delete-folder',
                text: 'Move to Trash',
                action: () => actions.deleteFolder(node.id),
            }),
        ],
    });

    await menu.popup();
}

// ── Sidebar: Explorer Empty Area Context Menu ────────────────────────────────

export async function showExplorerContextMenu(actions: StoreActions) {
    const menu = await Menu.new({
        items: [
            await MenuItem.new({
                id: 'new-note',
                text: 'New Note',
                action: () => actions.createFile(),
            }),
            await MenuItem.new({
                id: 'new-folder',
                text: 'New Folder',
                action: () => actions.createFolder(null),
            }),
        ],
    });

    await menu.popup();
}

// ── Editor Context Menu ──────────────────────────────────────────────────────

export async function showEditorContextMenu() {
    const menu = await Menu.new({
        items: [
            await PredefinedMenuItem.new({ item: 'Undo' }),
            await PredefinedMenuItem.new({ item: 'Redo' }),
            await sep(),
            await PredefinedMenuItem.new({ item: 'Cut' }),
            await PredefinedMenuItem.new({ item: 'Copy' }),
            await PredefinedMenuItem.new({ item: 'Paste' }),
            await sep(),
            await PredefinedMenuItem.new({ item: 'SelectAll' }),
        ],
    });

    await menu.popup();
}

// ── Tab Context Menu ─────────────────────────────────────────────────────────

export async function showTabContextMenu(fileId: string, actions: StoreActions) {
    const file = actions.findFile(fileId);
    const filePath = file?.path;

    const items: (MenuItem | PredefinedMenuItem)[] = [
        await MenuItem.new({
            id: 'close',
            text: 'Close',
            action: () => actions.closeFile(fileId),
        }),
        await MenuItem.new({
            id: 'close-others',
            text: 'Close Others',
            action: () => actions.closeOtherFiles(fileId),
        }),
        await MenuItem.new({
            id: 'close-all',
            text: 'Close All',
            action: () => actions.closeAllFiles(),
        }),
    ];

    if (filePath) {
        items.push(
            await sep(),
            await MenuItem.new({
                id: 'copy-path',
                text: 'Copy Path',
                action: () => copyPathToClipboard(filePath),
            }),
        );
    }

    const menu = await Menu.new({ items });
    await menu.popup();
}

