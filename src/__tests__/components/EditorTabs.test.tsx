import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditorTabs } from '../../components/layout/editor/EditorTabs';
import { useAppStore } from '../../store/useAppStore';

// Mock dependencies
vi.mock('../../store/useAppStore');
vi.mock('../../util/contextMenu', () => ({
  showTabContextMenu: vi.fn(),
}));

const mockUseAppStore = vi.mocked(useAppStore);

function createMockStoreReturn(overrides: Record<string, unknown> = {}) {
  return {
    openFiles: [],
    activeFileId: null,
    selectFile: vi.fn(),
    closeFile: vi.fn(),
    findFile: vi.fn(() => null),
    createNewTab: vi.fn(),
    toggleExplorerCollapsed: vi.fn(),
    isExplorerCollapsed: false,
    openFileInNewTab: vi.fn(),
    setRenamingFileId: vi.fn(),
    deleteFile: vi.fn(),
    deleteFolder: vi.fn(),
    duplicateFile: vi.fn(),
    createFile: vi.fn(),
    createFileInFolder: vi.fn(),
    createFolder: vi.fn(),
    closeOtherFiles: vi.fn(),
    closeAllFiles: vi.fn(),
    togglePin: vi.fn(),
    ...overrides,
  };
}

describe('EditorTabs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders an empty tab bar when no files are open', () => {
    mockUseAppStore.mockReturnValue(createMockStoreReturn());

    render(<EditorTabs />);
    // Should have the New Tab and Sidebar Toggle buttons
    expect(screen.getByTitle('New Tab')).toBeInTheDocument();
    expect(screen.getByTitle('Toggle Sidebar')).toBeInTheDocument();
  });

  it('renders a welcome tab correctly', () => {
    mockUseAppStore.mockReturnValue(
      createMockStoreReturn({
        openFiles: ['welcome'],
        activeFileId: 'welcome',
      })
    );

    render(<EditorTabs />);
    expect(screen.getByText('Welcome')).toBeInTheDocument();
  });

  it('renders a blank "Untitled" tab', () => {
    mockUseAppStore.mockReturnValue(
      createMockStoreReturn({
        openFiles: ['new-tab-1'],
        activeFileId: 'new-tab-1',
      })
    );

    render(<EditorTabs />);
    expect(screen.getByText('Untitled')).toBeInTheDocument();
  });

  it('renders system tabs with correct names', () => {
    mockUseAppStore.mockReturnValue(
      createMockStoreReturn({
        openFiles: ['cinder-settings', 'cinder-info', 'cinder-trash'],
        activeFileId: 'cinder-settings',
      })
    );

    render(<EditorTabs />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Trash')).toBeInTheDocument();
  });

  it('renders a regular file tab with the name from findFile (without .md)', () => {
    mockUseAppStore.mockReturnValue(
      createMockStoreReturn({
        openFiles: ['/workspace/notes.md'],
        activeFileId: '/workspace/notes.md',
        findFile: vi.fn((id: string) =>
          id === '/workspace/notes.md'
            ? { id, name: 'notes.md', type: 'file' as const, path: id }
            : null
        ),
      })
    );

    render(<EditorTabs />);
    expect(screen.getByText('notes')).toBeInTheDocument();
  });

  it('calls selectFile when a tab is clicked', async () => {
    const selectFile = vi.fn();
    mockUseAppStore.mockReturnValue(
      createMockStoreReturn({
        openFiles: ['welcome'],
        activeFileId: 'welcome',
        selectFile,
      })
    );

    const user = userEvent.setup();
    render(<EditorTabs />);

    await user.click(screen.getByText('Welcome'));
    expect(selectFile).toHaveBeenCalledWith('welcome');
  });

  it('calls createNewTab when the "New Tab" button is clicked', async () => {
    const createNewTab = vi.fn();
    mockUseAppStore.mockReturnValue(createMockStoreReturn({ createNewTab }));

    const user = userEvent.setup();
    render(<EditorTabs />);

    await user.click(screen.getByTitle('New Tab'));
    expect(createNewTab).toHaveBeenCalledOnce();
  });

  it('calls toggleExplorerCollapsed when the "Toggle Sidebar" button is clicked', async () => {
    const toggleExplorerCollapsed = vi.fn();
    mockUseAppStore.mockReturnValue(
      createMockStoreReturn({ toggleExplorerCollapsed })
    );

    const user = userEvent.setup();
    render(<EditorTabs />);

    await user.click(screen.getByTitle('Toggle Sidebar'));
    expect(toggleExplorerCollapsed).toHaveBeenCalledOnce();
  });

  it('shows "Exit Fullscreen" title when explorer is collapsed', () => {
    mockUseAppStore.mockReturnValue(
      createMockStoreReturn({ isExplorerCollapsed: true })
    );

    render(<EditorTabs />);
    expect(screen.getByTitle('Exit Fullscreen')).toBeInTheDocument();
  });

  it('shows "Fullscreen Editor" title when explorer is not collapsed', () => {
    mockUseAppStore.mockReturnValue(
      createMockStoreReturn({ isExplorerCollapsed: false })
    );

    render(<EditorTabs />);
    expect(screen.getByTitle('Fullscreen Editor')).toBeInTheDocument();
  });
});
