import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import { useAppStore } from '../store/useAppStore';
import { joinPath } from '../utils/pathUtils';

export interface FileEntry {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  modifiedAt?: number;
  children?: FileEntry[];
}

export function useWorkspace() {
  const {
    workspacePath,
    setWorkspacePath,
    setFiles,
    resetWorkspace,
    addRecentWorkspace,
  } = useAppStore();

  const selectWorkspace = async (): Promise<string | null> => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Select Workspace Folder',
      });

      if (selected && typeof selected === 'string') {
        return selected;
      }
      return null;
    } catch (error) {
      console.error('Failed to open folder dialog:', error);
      return null;
    }
  };

  const loadWorkspace = async (path: string): Promise<boolean> => {
    try {
      const entries = await invoke<FileEntry[]>('scan_workspace', { path });

      // Convert FileEntry to FileNode format used by the app
      const convertToFileNode = (
        entry: FileEntry
      ): import('../types/fileSystem').FileNode => ({
        id: entry.id,
        name: entry.name,
        type: entry.type,
        path: entry.path,
        modifiedAt: entry.modifiedAt,
        children: entry.children?.map(convertToFileNode),
      });

      const files = entries.map(convertToFileNode);
      setFiles(files);
      setWorkspacePath(path);
      addRecentWorkspace(path);
      return true;
    } catch (error) {
      console.error('Failed to load workspace:', error);
      return false;
    }
  };

  const selectAndLoadWorkspace = async (): Promise<boolean> => {
    const path = await selectWorkspace();
    if (path) {
      return await loadWorkspace(path);
    }
    return false;
  };

  const changeWorkspace = () => {
    resetWorkspace();
  };

  const openRecentWorkspace = async (path: string): Promise<boolean> => {
    resetWorkspace();
    return await loadWorkspace(path);
  };

  const createWorkspace = async (): Promise<string | null> => {
    try {
      const parentDir = await open({
        directory: true,
        multiple: false,
        title: 'Choose location for new workspace',
      });

      if (!parentDir || typeof parentDir !== 'string') {
        return null;
      }

      const baseName = 'My Notes';
      let folderName = baseName;
      let attempt = 0;

      while (attempt < 50) {
        const folderPath = joinPath(parentDir, folderName);
        try {
          await invoke('create_folder', { path: folderPath });
          return folderPath;
        } catch {
          attempt++;
          folderName = `${baseName} ${attempt}`;
        }
      }
      return null;
    } catch (error) {
      console.error('Failed to create workspace folder:', error);
      return null;
    }
  };

  const createAndLoadWorkspace = async (): Promise<boolean> => {
    const path = await createWorkspace();
    if (path) {
      return await loadWorkspace(path);
    }
    return false;
  };

  const refreshWorkspace = async (): Promise<boolean> => {
    if (workspacePath) {
      return await loadWorkspace(workspacePath);
    }
    return false;
  };

  return {
    workspacePath,
    selectWorkspace,
    createWorkspace,
    loadWorkspace,
    selectAndLoadWorkspace,
    createAndLoadWorkspace,
    changeWorkspace,
    openRecentWorkspace,
    refreshWorkspace,
    hasWorkspace: !!workspacePath,
  };
}
