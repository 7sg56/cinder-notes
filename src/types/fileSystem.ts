export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path?: string;
  content?: string;
  modifiedAt?: number;
  children?: FileNode[];
}
