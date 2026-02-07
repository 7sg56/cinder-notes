import { invoke } from '@tauri-apps/api/core';
import { useAppStore } from '../store/useAppStore';
import { useWorkspace } from './useWorkspace';

export function useFileSystem() {
    const { workspacePath } = useAppStore();
    const { refreshWorkspace } = useWorkspace();

    const readFile = async (path: string): Promise<string | null> => {
        try {
            const content = await invoke<string>('read_note', { path });
            return content;
        } catch (error) {
            console.error('Failed to read file:', error);
            return null;
        }
    };

    const writeFile = async (path: string, content: string): Promise<boolean> => {
        try {
            await invoke('write_note', { path, content });
            return true;
        } catch (error) {
            console.error('Failed to write file:', error);
            return false;
        }
    };

    const createFile = async (path: string): Promise<boolean> => {
        try {
            await invoke('create_note', { path });
            await refreshWorkspace();
            return true;
        } catch (error) {
            console.error('Failed to create file:', error);
            return false;
        }
    };

    const deleteFile = async (path: string): Promise<boolean> => {
        try {
            await invoke('delete_note', { path });
            await refreshWorkspace();
            return true;
        } catch (error) {
            console.error('Failed to delete file:', error);
            return false;
        }
    };

    const renameFile = async (oldPath: string, newPath: string): Promise<boolean> => {
        try {
            await invoke('rename_note', { oldPath, newPath });
            await refreshWorkspace();
            return true;
        } catch (error) {
            console.error('Failed to rename file:', error);
            return false;
        }
    };

    const createFolder = async (path: string): Promise<boolean> => {
        try {
            await invoke('create_folder', { path });
            await refreshWorkspace();
            return true;
        } catch (error) {
            console.error('Failed to create folder:', error);
            return false;
        }
    };

    const deleteFolder = async (path: string): Promise<boolean> => {
        try {
            await invoke('delete_folder', { path });
            await refreshWorkspace();
            return true;
        } catch (error) {
            console.error('Failed to delete folder:', error);
            return false;
        }
    };

    const getFullPath = (filename: string): string => {
        if (!workspacePath) return filename;
        return `${workspacePath}/${filename}`;
    };

    return {
        readFile,
        writeFile,
        createFile,
        deleteFile,
        renameFile,
        createFolder,
        deleteFolder,
        getFullPath,
    };
}
