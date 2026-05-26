import { useWorkspace } from '../../hooks/useWorkspace';
import { useAppStore } from '../../store/useAppStore';
import { FolderOpen, FolderPlus, X } from 'lucide-react';
import './WorkspaceWelcome.css';

export function WorkspaceWelcome() {
  const { selectAndLoadWorkspace, createAndLoadWorkspace, loadWorkspace } =
    useWorkspace();
  const recentWorkspaces = useAppStore((state) => state.recentWorkspaces);
  const removeRecentWorkspace = useAppStore(
    (state) => state.removeRecentWorkspace
  );

  const isMac = navigator.userAgent.includes('Mac');
  const cmdKey = isMac ? 'Cmd' : 'Ctrl';

  const handleOpenRecent = async (path: string) => {
    const success = await loadWorkspace(path);
    if (!success) {
      removeRecentWorkspace(path);
    }
  };

  const handleRemoveRecent = (e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    removeRecentWorkspace(path);
  };

  return (
    <div className="welcome-view" data-testid="welcome-page">
      <div className="welcome-drag-region" data-tauri-drag-region />

      <div className="welcome-content">
        {/* Brand */}
        <div className="welcome-brand">
          <img
            src="/app-icon.png"
            alt="Cinder"
            className="welcome-logo"
            draggable={false}
          />
          <h1 className="welcome-title">Cinder</h1>
        </div>

        {/* Actions */}
        <div className="welcome-actions">
          <button
            className="welcome-action"
            onClick={() => createAndLoadWorkspace()}
            id="welcome-create-new"
            data-testid="welcome-create-new"
          >
            <div className="welcome-action-icon">
              <FolderPlus size={15} strokeWidth={1.5} />
            </div>
            <div className="welcome-action-text">
              <div className="welcome-action-name">New Workspace</div>
              <div className="welcome-action-desc">
                Create a fresh folder for your notes
              </div>
            </div>
          </button>

          <button
            className="welcome-action"
            onClick={() => selectAndLoadWorkspace()}
            id="welcome-open-existing"
            data-testid="welcome-open-folder"
          >
            <div className="welcome-action-icon">
              <FolderOpen size={15} strokeWidth={1.5} />
            </div>
            <div className="welcome-action-text">
              <div className="welcome-action-name">Open Folder</div>
              <div className="welcome-action-desc">
                Open an existing folder as workspace
              </div>
            </div>
          </button>
        </div>

        {/* Recent Workspaces */}
        {recentWorkspaces.length > 0 && (
          <>
            <div className="welcome-divider" />
            <div className="welcome-recents">
              <span className="welcome-recents-label">Recent</span>
              {recentWorkspaces.map((ws) => (
                <button
                  key={ws.path}
                  className="welcome-recent"
                  onClick={() => handleOpenRecent(ws.path)}
                  data-testid="recent-workspace"
                >
                  <div className="welcome-recent-icon">
                    <FolderOpen size={14} strokeWidth={1.5} />
                  </div>
                  <div className="welcome-recent-info">
                    <span className="welcome-recent-name">{ws.name}</span>
                    <span className="welcome-recent-path" title={ws.path}>
                      {ws.path}
                    </span>
                  </div>
                  <button
                    className="welcome-recent-remove"
                    onClick={(e) => handleRemoveRecent(e, ws.path)}
                    title="Remove from recent"
                    aria-label="Remove from recent workspaces"
                    data-testid="recent-workspace-remove"
                  >
                    <X size={11} />
                  </button>
                </button>
              ))}
            </div>
          </>
        )}

        <p className="welcome-hint" data-testid="welcome-hint">
          <kbd>{cmdKey}+O</kbd> to open a folder anytime
        </p>
      </div>
    </div>
  );
}
