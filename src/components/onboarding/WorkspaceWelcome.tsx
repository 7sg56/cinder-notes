import { useWorkspace } from '../../hooks/useWorkspace';
import { FolderOpen, FolderPlus, ChevronRight } from 'lucide-react';
import './WorkspaceWelcome.css';

/**
 * Inline welcome view shown in the main window when no workspace is open.
 * Offers two actions: create a new workspace folder or open an existing one.
 */
export function WorkspaceWelcome() {
  const { selectAndLoadWorkspace, createAndLoadWorkspace } = useWorkspace();

  const isMac = navigator.userAgent.includes('Mac');
  const cmdKey = isMac ? 'Cmd' : 'Ctrl';

  return (
    <div className="welcome-view">
      {/* Title bar drag region */}
      <div className="welcome-drag-region" data-tauri-drag-region />

      {/* Ambient background effects */}
      <div className="welcome-bg-glow welcome-bg-glow--1" />
      <div className="welcome-bg-glow welcome-bg-glow--2" />

      <div className="welcome-content">
        {/* Brand */}
        <div className="welcome-brand">
          <div className="welcome-logo-ring">
            <span className="welcome-logo-icon">C</span>
          </div>
          <h1 className="welcome-title">Cinder</h1>
          <p className="welcome-subtitle">Minimal markdown notes</p>
        </div>

        {/* Actions */}
        <div className="welcome-section">
          <div className="welcome-section-label">Start</div>
          <div className="welcome-actions">
            <button
              className="welcome-action-card"
              onClick={() => createAndLoadWorkspace()}
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
              onClick={() => selectAndLoadWorkspace()}
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

        <p className="welcome-hint">
          <kbd>{cmdKey}+O</kbd> to open a folder anytime
        </p>
      </div>
    </div>
  );
}
