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
    id: 'root',
    name: '.cinder',
    type: 'folder',
    children: [
      {
        id: '1',
        name: 'Welcome.md',
        type: 'file',
        content: '# Welcome to Cinder Notes\n\nThis is a minimal modal note app.',
      },
      {
        id: '2',
        name: 'Todo',
        type: 'folder',
        children: [
          {
            id: '2-1',
            name: 'Personal.md',
            type: 'file',
            content: '# Personal Todos\n\n- [ ] Buy groceries\n- [ ] Call mom',
          },
          {
            id: '2-2',
            name: 'Work.md',
            type: 'file',
            content: '# Work Todos\n\n- [ ] Finish scaffolding\n- [ ] Review PRs',
          },
        ],
      },
      {
        id: '3',
        name: 'Ideas.md',
        type: 'file',
        content: '# App Ideas\n\n- [ ] Add dark mode\n- [ ] Add vim mode',
      },
    ],
  },
];
