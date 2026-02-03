export type FileType = 'file' | 'folder';

export interface FileNode {
  id: string;
  name: string;
  type: FileType;
  path?: string;  // Full absolute path for real filesystem
  children?: FileNode[];
  content?: string; // For in-memory content (optional for real FS)
}

// Empty initial state - will be populated from workspace
export const mockFileSystem: FileNode[] = [];

