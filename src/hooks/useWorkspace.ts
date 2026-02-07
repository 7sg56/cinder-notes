import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import { useAppStore } from '../store/useAppStore';

export interface FileEntry {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileEntry[];
}

export function useWorkspace() {
  const { workspacePath, setWorkspacePath, setFiles, resetWorkspace } = useAppStore();

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
      const convertToFileNode = (entry: FileEntry): import('../data/mockFileSystem').FileNode => ({
        id: entry.id,
        name: entry.name,
        type: entry.type,
        path: entry.path,
        children: entry.children?.map(convertToFileNode),
      });

      const files = entries.map(convertToFileNode);
      setFiles(files);
      setWorkspacePath(path);
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

  const changeWorkspace = async (): Promise<boolean> => {
    const path = await selectWorkspace();
    if (path) {
      resetWorkspace();
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
    loadWorkspace,
    selectAndLoadWorkspace,
    changeWorkspace,
    refreshWorkspace,
    hasWorkspace: !!workspacePath,
  };
}
