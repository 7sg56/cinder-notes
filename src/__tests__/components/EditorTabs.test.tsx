/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EditorTabs } from '../../components/layout/editor/EditorTabs';
import { useAppStore } from '../../store/useAppStore';
import { useSplitStore } from '../../store/useSplitStore';

// Mock dependencies
vi.mock('../../store/useAppStore');
vi.mock('../../store/useSplitStore');
vi.mock('../../util/contextMenu', () => ({
  showTabContextMenu: vi.fn(),
}));
vi.mock('../../util/dragContext', () => ({
  setCurrentDrag: vi.fn(),
}));

const mockUseAppStore = vi.mocked(useAppStore);
const mockUseSplitStore = vi.mocked(useSplitStore);

const TEST_PANE_ID = 'pane-test';

function createMockAppStoreReturn(overrides: Record<string, unknown> = {}) {
  return {
    findFile: vi.fn(() => null),
    toggleExplorerCollapsed: vi.fn(),
    isExplorerCollapsed: false,
    setRenamingFileId: vi.fn(),
    deleteFile: vi.fn(),
    deleteFolder: vi.fn(),
    duplicateFile: vi.fn(),
    createFile: vi.fn(),
    createFileInFolder: vi.fn(),
    createFolder: vi.fn(),
    togglePin: vi.fn(),
    ...overrides,
  };
}

function createMockSplitStoreReturn(overrides: Record<string, unknown> = {}) {
  const defaults = {
    panes: {
      [TEST_PANE_ID]: {
        openFiles: [] as string[],
        activeFileId: null as string | null,
        activeFileContent: '',
      },
    },
    rootNode: { type: 'leaf' as const, paneId: TEST_PANE_ID },
    maximizedPaneId: null as string | null,
    ...overrides,
  };

  // useSplitStore is called with a selector, so we mock it to invoke the selector
  return (selector: (state: typeof defaults) => unknown) => selector(defaults);
}

describe('EditorTabs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders an empty tab bar when no files are open', () => {
    mockUseAppStore.mockReturnValue(createMockAppStoreReturn());
    mockUseSplitStore.mockImplementation(createMockSplitStoreReturn() as any);

    render(<EditorTabs paneId={TEST_PANE_ID} />);
    expect(screen.getByTitle('New Tab')).toBeInTheDocument();
    expect(screen.getByTitle('Toggle Sidebar')).toBeInTheDocument();
  });

  it('renders a blank "Untitled" tab', () => {
    mockUseAppStore.mockReturnValue(createMockAppStoreReturn());
    mockUseSplitStore.mockImplementation(
      createMockSplitStoreReturn({
        panes: {
          [TEST_PANE_ID]: {
            openFiles: ['new-tab-1'],
            activeFileId: 'new-tab-1',
            activeFileContent: '',
          },
        },
      }) as any
    );

    render(<EditorTabs paneId={TEST_PANE_ID} />);
    expect(screen.getByText('Untitled')).toBeInTheDocument();
  });

  it('renders system tabs with correct names', () => {
    mockUseAppStore.mockReturnValue(createMockAppStoreReturn());
    mockUseSplitStore.mockImplementation(
      createMockSplitStoreReturn({
        panes: {
          [TEST_PANE_ID]: {
            openFiles: ['cinder-settings', 'cinder-info', 'cinder-trash'],
            activeFileId: 'cinder-settings',
            activeFileContent: '',
          },
        },
      }) as any
    );

    render(<EditorTabs paneId={TEST_PANE_ID} />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Trash')).toBeInTheDocument();
  });

  it('renders a regular file tab with the name from findFile (without .md)', () => {
    mockUseAppStore.mockReturnValue(
      createMockAppStoreReturn({
        findFile: vi.fn((id: string) =>
          id === '/workspace/notes.md'
            ? { id, name: 'notes.md', type: 'file' as const, path: id }
            : null
        ),
      })
    );
    mockUseSplitStore.mockImplementation(
      createMockSplitStoreReturn({
        panes: {
          [TEST_PANE_ID]: {
            openFiles: ['/workspace/notes.md'],
            activeFileId: '/workspace/notes.md',
            activeFileContent: '',
          },
        },
      }) as any
    );

    render(<EditorTabs paneId={TEST_PANE_ID} />);
    expect(screen.getByText('notes')).toBeInTheDocument();
  });

  it('shows "Toggle Sidebar" button', () => {
    mockUseAppStore.mockReturnValue(createMockAppStoreReturn());
    mockUseSplitStore.mockImplementation(createMockSplitStoreReturn() as any);

    render(<EditorTabs paneId={TEST_PANE_ID} />);
    expect(screen.getByTitle('Toggle Sidebar')).toBeInTheDocument();
  });

  it('shows "Close Pane" and "Maximize Pane" buttons when multiple panes exist', () => {
    mockUseAppStore.mockReturnValue(createMockAppStoreReturn());
    mockUseSplitStore.mockImplementation(
      createMockSplitStoreReturn({
        rootNode: {
          type: 'branch' as const,
          axis: 'horizontal',
          children: [
            { type: 'leaf' as const, paneId: TEST_PANE_ID },
            { type: 'leaf' as const, paneId: 'pane-other' },
          ],
          flexes: [0.5, 0.5],
        },
      }) as any
    );

    render(<EditorTabs paneId={TEST_PANE_ID} />);
    expect(screen.getByTitle('Close Pane')).toBeInTheDocument();
    expect(screen.getByTitle('Maximize Pane')).toBeInTheDocument();
  });

  it('shows "Restore Split" title when pane is maximized', () => {
    mockUseAppStore.mockReturnValue(createMockAppStoreReturn());
    mockUseSplitStore.mockImplementation(
      createMockSplitStoreReturn({
        rootNode: {
          type: 'branch' as const,
          axis: 'horizontal',
          children: [
            { type: 'leaf' as const, paneId: TEST_PANE_ID },
            { type: 'leaf' as const, paneId: 'pane-other' },
          ],
          flexes: [0.5, 0.5],
        },
        maximizedPaneId: TEST_PANE_ID,
      }) as any
    );

    render(<EditorTabs paneId={TEST_PANE_ID} />);
    expect(screen.getByTitle('Restore Split')).toBeInTheDocument();
  });

  it('does not show "Close Pane" when there is a single pane', () => {
    mockUseAppStore.mockReturnValue(createMockAppStoreReturn());
    mockUseSplitStore.mockImplementation(createMockSplitStoreReturn() as any);

    render(<EditorTabs paneId={TEST_PANE_ID} />);
    expect(screen.queryByTitle('Close Pane')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Maximize Pane')).not.toBeInTheDocument();
  });

  it('renders an unknown file as "Unknown" when findFile returns null', () => {
    mockUseAppStore.mockReturnValue(
      createMockAppStoreReturn({ findFile: vi.fn(() => null) })
    );
    mockUseSplitStore.mockImplementation(
      createMockSplitStoreReturn({
        panes: {
          [TEST_PANE_ID]: {
            openFiles: ['nonexistent-file'],
            activeFileId: 'nonexistent-file',
            activeFileContent: '',
          },
        },
      }) as any
    );

    render(<EditorTabs paneId={TEST_PANE_ID} />);
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });
});
