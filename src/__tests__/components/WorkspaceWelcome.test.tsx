import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorkspaceWelcome } from '../../components/onboarding/WorkspaceWelcome';
import { useWorkspace } from '../../hooks/useWorkspace';
import { useAppStore } from '../../store/useAppStore';

// Mock dependencies
vi.mock('../../hooks/useWorkspace');
vi.mock('../../store/useAppStore');

// Mock CSS import
vi.mock('../../components/onboarding/WorkspaceWelcome.css', () => ({}));

const mockUseWorkspace = vi.mocked(useWorkspace);
const mockUseAppStore = vi.mocked(useAppStore);

describe('WorkspaceWelcome', () => {
  const mockSelectAndLoadWorkspace = vi.fn();
  const mockCreateAndLoadWorkspace = vi.fn();
  const mockLoadWorkspace = vi.fn();
  const mockRemoveRecentWorkspace = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseWorkspace.mockReturnValue({
      selectAndLoadWorkspace: mockSelectAndLoadWorkspace,
      createAndLoadWorkspace: mockCreateAndLoadWorkspace,
      loadWorkspace: mockLoadWorkspace,
    } as unknown as ReturnType<typeof useWorkspace>);

    // Default: no recent workspaces
    mockUseAppStore.mockImplementation((selector: unknown) => {
      const state = {
        recentWorkspaces: [],
        removeRecentWorkspace: mockRemoveRecentWorkspace,
      };
      return typeof selector === 'function'
        ? (selector as (s: typeof state) => unknown)(state)
        : state;
    });
  });

  it('renders the brand title "Cinder"', () => {
    render(<WorkspaceWelcome />);
    expect(screen.getByText('Cinder')).toBeInTheDocument();
  });

  it('renders "New Workspace" and "Open Folder" action buttons', () => {
    render(<WorkspaceWelcome />);
    expect(screen.getByText('New Workspace')).toBeInTheDocument();
    expect(screen.getByText('Open Folder')).toBeInTheDocument();
  });

  it('renders the app icon image', () => {
    render(<WorkspaceWelcome />);
    const img = screen.getByAltText('Cinder');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/app-icon.png');
  });

  it('calls createAndLoadWorkspace when "New Workspace" is clicked', async () => {
    const user = userEvent.setup();
    render(<WorkspaceWelcome />);

    await user.click(screen.getByText('New Workspace'));
    expect(mockCreateAndLoadWorkspace).toHaveBeenCalledOnce();
  });

  it('calls selectAndLoadWorkspace when "Open Folder" is clicked', async () => {
    const user = userEvent.setup();
    render(<WorkspaceWelcome />);

    await user.click(screen.getByText('Open Folder'));
    expect(mockSelectAndLoadWorkspace).toHaveBeenCalledOnce();
  });

  it('does not show "Recent" section when there are no recent workspaces', () => {
    render(<WorkspaceWelcome />);
    expect(screen.queryByText('Recent')).not.toBeInTheDocument();
  });

  it('shows recent workspaces when they exist', () => {
    const recentWorkspaces = [
      { path: '/Users/test/notes', name: 'notes', lastOpened: Date.now() },
      {
        path: '/Users/test/journal',
        name: 'journal',
        lastOpened: Date.now() - 1000,
      },
    ];

    mockUseAppStore.mockImplementation((selector: unknown) => {
      const state = {
        recentWorkspaces,
        removeRecentWorkspace: mockRemoveRecentWorkspace,
      };
      return typeof selector === 'function'
        ? (selector as (s: typeof state) => unknown)(state)
        : state;
    });

    render(<WorkspaceWelcome />);
    expect(screen.getByText('Recent')).toBeInTheDocument();
    expect(screen.getByText('notes')).toBeInTheDocument();
    expect(screen.getByText('journal')).toBeInTheDocument();
  });

  it('shows the keyboard shortcut hint', () => {
    render(<WorkspaceWelcome />);
    expect(screen.getByText('to open a folder anytime')).toBeInTheDocument();
  });
});
