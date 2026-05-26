import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchPanel } from '../../components/features/SearchPanel';
import { useAppStore } from '../../store/useAppStore';

// Mock the store module
vi.mock('../../store/useAppStore');

const mockUseAppStore = vi.mocked(useAppStore);

function createMockStoreReturn(overrides: Record<string, unknown> = {}) {
  return {
    isSearchOpen: false,
    searchQuery: '',
    searchResults: [],
    workspacePath: '/test/workspace',
    setSearchOpen: vi.fn(),
    setSearchQuery: vi.fn(),
    setSearchResults: vi.fn(),
    selectFile: vi.fn(),
    ...overrides,
  };
}

describe('SearchPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when isSearchOpen is false', () => {
    mockUseAppStore.mockReturnValue(
      createMockStoreReturn({ isSearchOpen: false })
    );

    const { container } = render(<SearchPanel />);
    expect(container.innerHTML).toBe('');
  });

  it('renders the search input when isSearchOpen is true', () => {
    mockUseAppStore.mockReturnValue(
      createMockStoreReturn({ isSearchOpen: true })
    );

    render(<SearchPanel />);
    expect(screen.getByPlaceholderText('Search files...')).toBeInTheDocument();
  });

  it('calls setSearchQuery when user types in the input', async () => {
    const setSearchQuery = vi.fn();
    mockUseAppStore.mockReturnValue(
      createMockStoreReturn({ isSearchOpen: true, setSearchQuery })
    );

    const user = userEvent.setup();
    render(<SearchPanel />);

    const input = screen.getByPlaceholderText('Search files...');
    await user.type(input, 'a');
    expect(setSearchQuery).toHaveBeenCalled();
  });

  it('closes when the close button is clicked', async () => {
    const setSearchOpen = vi.fn();
    mockUseAppStore.mockReturnValue(
      createMockStoreReturn({ isSearchOpen: true, setSearchOpen })
    );

    const user = userEvent.setup();
    render(<SearchPanel />);

    // Find the close button (the X button in the search input row)
    const buttons = screen.getAllByRole('button');
    // The close button is the one in the header area (the first button)
    await user.click(buttons[0]);
    expect(setSearchOpen).toHaveBeenCalledWith(false);
  });

  it('displays "No files found" when search query has results empty', () => {
    mockUseAppStore.mockReturnValue(
      createMockStoreReturn({
        isSearchOpen: true,
        searchQuery: 'nonexistent',
        searchResults: [],
      })
    );

    render(<SearchPanel />);
    expect(
      screen.getByText(/No files found for "nonexistent"/)
    ).toBeInTheDocument();
  });

  it('renders search results when available', () => {
    const results = [
      {
        file_path: '/test/workspace/notes.md',
        file_name: 'notes.md',
        line_number: 0,
        content_preview: 'workspace/notes.md',
      },
      {
        file_path: '/test/workspace/todo.md',
        file_name: 'todo.md',
        line_number: 0,
        content_preview: 'workspace/todo.md',
      },
    ];

    mockUseAppStore.mockReturnValue(
      createMockStoreReturn({
        isSearchOpen: true,
        searchQuery: 'note',
        searchResults: results,
      })
    );

    render(<SearchPanel />);
    // file_name is rendered in one span and content_preview in another
    expect(screen.getAllByText('notes.md').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('todo.md').length).toBeGreaterThanOrEqual(1);
  });

  it('calls selectFile and closes when a result is clicked', async () => {
    const selectFile = vi.fn();
    const setSearchOpen = vi.fn();

    const results = [
      {
        file_path: '/test/workspace/notes.md',
        file_name: 'notes.md',
        line_number: 0,
        content_preview: 'workspace/notes.md',
      },
    ];

    mockUseAppStore.mockReturnValue(
      createMockStoreReturn({
        isSearchOpen: true,
        searchQuery: 'note',
        searchResults: results,
        selectFile,
        setSearchOpen,
      })
    );

    const user = userEvent.setup();
    render(<SearchPanel />);

    // Click the first element matching 'notes.md' (the file name span)
    const matches = screen.getAllByText('notes.md');
    await user.click(matches[0]);
    expect(selectFile).toHaveBeenCalledWith('/test/workspace/notes.md');
    expect(setSearchOpen).toHaveBeenCalledWith(false);
  });

  it('renders the close button', () => {
    mockUseAppStore.mockReturnValue(
      createMockStoreReturn({ isSearchOpen: true })
    );

    render(<SearchPanel />);
    // The close button contains an X icon - find it by its role
    const buttons = screen.getAllByRole('button');
    // The close button is the one in the search input row (not result buttons)
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });
});
