export type FileType = 'file' | 'folder';

export interface FileNode {
  id: string;
  name: string;
  type: FileType;
  children?: FileNode[];
  content?: string; // For mock purposes, we store content here
}

export const mockFileSystem: FileNode[] = [
  {
    id: 'folder-1',
    name: 'Project Alpha',
    type: 'folder',
    children: [
      { id: 'file-1-1', name: 'Notes.md', type: 'file', content: '# Alpha Notes\n- Important item' },
      { id: 'file-1-2', name: 'Specs.md', type: 'file', content: '# Specifications\n- v1.0' },
    ]
  },
  {
    id: 'folder-2',
    name: 'Personal',
    type: 'folder',
    children: []
  },
  { id: 'file-root-1', name: 'Todo.md', type: 'file', content: '- [ ] Buy milk' },
  { id: 'file-root-2', name: 'Ideas.md', type: 'file', content: '# Ideas\n- New app' }
];
