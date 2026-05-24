import { useState } from 'react';
import { useWorkspace } from '../../hooks/useWorkspace';
import { useAppStore } from '../../store/useAppStore';
import {
  FolderOpen,
  FolderPlus,
  Clock,
  X,
  ChevronRight,
  Search,
} from 'lucide-react';
import { emit } from '@tauri-apps/api/event';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { splitPath, SEP } from '../../utils/pathUtils';
import './WorkspaceWelcome.css';

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

function truncatePath(path: string, maxLen = 35): string {
  if (path.length <= maxLen) return path;
  const parts = splitPath(path);
  if (parts.length <= 3) return '...' + path.slice(-maxLen);
  return parts[0] + SEP + '...' + SEP + parts.slice(-2).join(SEP);
}

interface WorkspaceWelcomeProps {
  isStandaloneWindow?: boolean;
}

export function WorkspaceWelcome({
  isStandaloneWindow = true,
}: WorkspaceWelcomeProps) {
  const {
    selectWorkspace,
    selectAndLoadWorkspace,
    createWorkspace,
    createAndLoadWorkspace,
    openRecentWorkspace,
  } = useWorkspace();
  const recentWorkspaces = useAppStore((state) => state.recentWorkspaces);
  const removeRecentWorkspace = useAppStore(
    (state) => state.removeRecentWorkspace
  );
  const [loadingPath, setLoadingPath] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleOpenExisting = async () => {
    if (isStandaloneWindow) {
      const path = await selectWorkspace();
      if (path) {
        await emit('load-workspace-request', path);
        getCurrentWindow().close();
      }
    } else {
      await selectAndLoadWorkspace();
    }
  };

  const handleCreateNew = async () => {
    if (isStandaloneWindow) {
      const path = await createWorkspace();
      if (path) {
        await emit('load-workspace-request', path);
        getCurrentWindow().close();
      }
    } else {
      await createAndLoadWorkspace();
    }
  };

  const handleOpenRecent = async (path: string) => {
    if (isStandaloneWindow) {
      await emit('load-workspace-request', path);
      getCurrentWindow().close();
    } else {
      setLoadingPath(path);
      const success = await openRecentWorkspace(path);
      if (!success) {
        console.log('Failed to open recent workspace:', path);
      }
      setLoadingPath(null);
    }
  };

  const handleRemoveRecent = (e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    removeRecentWorkspace(path);
  };

  const filteredRecents = recentWorkspaces.filter(
    (ws) =>
      ws.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ws.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="welcome-screen">
      {/* Ambient background effects */}
      <div className="welcome-bg-glow welcome-bg-glow--1" />
      <div className="welcome-bg-glow welcome-bg-glow--2" />

      <div className="welcome-container">
        {/* Left Column: Recent Workspaces */}
        <div className="welcome-pane welcome-pane--left">
          <div className="welcome-section-header">
            <div className="welcome-pane-title-row">
              <Clock size={14} strokeWidth={2} />
              <h2 className="welcome-pane-title">Recent</h2>
            </div>
            {recentWorkspaces.length > 0 && (
              <div className="welcome-search-wrapper">
                <Search size={12} className="welcome-search-icon" />
                <input
                  type="text"
                  placeholder="Search recent..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="welcome-search-input"
                />
              </div>
            )}
          </div>

          <div className="welcome-recents-container">
            {recentWorkspaces.length === 0 ? (
              <div className="welcome-empty-recents">
                <FolderOpen size={24} strokeWidth={1} />
                <span>No recent workspaces</span>
              </div>
            ) : filteredRecents.length === 0 ? (
              <div className="welcome-empty-recents">
                <span>No matches found</span>
              </div>
            ) : (
              <div className="welcome-recents-list">
                {filteredRecents.map((ws, i) => (
                  <button
                    key={ws.path}
                    className="welcome-recent-item"
                    onClick={() => handleOpenRecent(ws.path)}
                    disabled={loadingPath === ws.path}
                    style={{ animationDelay: `${i * 40}ms` }}
                    id={`welcome-recent-${i}`}
                  >
                    <div className="welcome-recent-icon">
                      <FolderOpen size={14} strokeWidth={1.5} />
                    </div>
                    <div className="welcome-recent-info">
                      <span className="welcome-recent-name">{ws.name}</span>
                      <span className="welcome-recent-path" title={ws.path}>
                        {truncatePath(ws.path)}
                      </span>
                    </div>
                    <span className="welcome-recent-time">
                      {timeAgo(ws.lastOpened)}
                    </span>
                    <button
                      className="welcome-recent-remove"
                      onClick={(e) => handleRemoveRecent(e, ws.path)}
                      title="Remove from recent"
                      aria-label="Remove from recent workspaces"
                    >
                      <X size={12} />
                    </button>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="welcome-divider" />

        {/* Right Column: Branding & Primary Actions */}
        <div className="welcome-pane welcome-pane--right">
          {/* Brand */}
          <div className="welcome-brand">
            <div className="welcome-logo-ring">
              <span className="welcome-logo-icon">C</span>
            </div>
            <h1 className="welcome-title">Cinder</h1>
            <p className="welcome-subtitle">Minimal markdown notes</p>
          </div>

          {/* Start Actions */}
          <div className="welcome-section">
            <div className="welcome-section-label">Start</div>
            <div className="welcome-actions">
              <button
                className="welcome-action-card"
                onClick={handleCreateNew}
                id="welcome-create-new"
              >
                <div className="welcome-action-icon welcome-action-icon--create">
                  <FolderPlus size={20} strokeWidth={1.5} />
                </div>
                <div className="welcome-action-text">
                  <span className="welcome-action-title">New Workspace</span>
                  <span className="welcome-action-desc">
                    Create a fresh folder for your notes
                  </span>
                </div>
                <ChevronRight
                  size={14}
                  className="welcome-action-arrow"
                  strokeWidth={2}
                />
              </button>

              <button
                className="welcome-action-card"
                onClick={handleOpenExisting}
                id="welcome-open-existing"
              >
                <div className="welcome-action-icon welcome-action-icon--open">
                  <FolderOpen size={20} strokeWidth={1.5} />
                </div>
                <div className="welcome-action-text">
                  <span className="welcome-action-title">Open Folder</span>
                  <span className="welcome-action-desc">
                    Open an existing folder as workspace
                  </span>
                </div>
                <ChevronRight
                  size={14}
                  className="welcome-action-arrow"
                  strokeWidth={2}
                />
              </button>
            </div>
          </div>

          {/* Version */}
          <p className="welcome-version">v0.1.2</p>
        </div>
      </div>
    </div>
  );
}
