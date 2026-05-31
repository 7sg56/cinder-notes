import {
  X,
  Plus,
  FileText,
  PanelLeft,
  Gift,
  Maximize2,
  Minimize2,
  Info,
  Settings,
  Trash2,
} from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';
import { useSplitStore } from '../../../store/useSplitStore';
import { showTabContextMenu } from '../../../util/contextMenu';
import { isMac } from '../../../util/tauri';

interface EditorTabsProps {
  paneId: string;
}

export function EditorTabs({ paneId }: EditorTabsProps) {
  // Pane-scoped state from split store
  const openFiles = useSplitStore(
    (state) => state.panes[paneId]?.openFiles ?? []
  );
  const activeFileId = useSplitStore(
    (state) => state.panes[paneId]?.activeFileId ?? null
  );
  const hasMultiplePanes = useSplitStore(
    (state) => state.rootNode.type === 'branch'
  );

  // Global state from app store
  const {
    findFile,
    toggleExplorerCollapsed,
    isExplorerCollapsed,
    setRenamingFileId,
    deleteFile,
    deleteFolder,
    duplicateFile,
    createFile,
    createFileInFolder,
    createFolder,
    togglePin,
  } = useAppStore();

  // Pane-scoped action wrappers
  const selectFile = (fileId: string) => {
    useSplitStore.getState().paneSelectFile(paneId, fileId);
  };
  const closeFile = (fileId: string) => {
    useSplitStore.getState().paneCloseFile(paneId, fileId);
  };
  const createNewTab = () => {
    useSplitStore.getState().paneCreateNewTab(paneId);
  };
  const openFileInNewTab = (fileId: string) => {
    useSplitStore.getState().paneOpenFileInNewTab(paneId, fileId);
  };
  const closeOtherFiles = (fileId: string) => {
    useSplitStore.getState().paneCloseOtherFiles(paneId, fileId);
  };
  const closeAllFiles = () => {
    useSplitStore.getState().paneCloseAllFiles(paneId);
  };

  return (
    <>
      <div
        data-tauri-drag-region
        data-testid="editor-tabs"
        className="flex items-center shrink-0 relative"
        style={{
          backgroundColor: 'var(--bg-primary)',
          height: '40px',
        }}
      >
        {/* macOS traffic lights spacer when sidebar is collapsed */}
        {isMac() && (
          <div
            data-tauri-drag-region
            className="shrink-0 h-full transition-[width] duration-200 ease-in-out"
            style={{ width: isExplorerCollapsed ? '84px' : '0px' }}
          />
        )}

        {/* Tabs List - Takes available space */}
        <div className="flex-1 flex overflow-x-auto no-scrollbar h-full">
          {openFiles.map((fileId) => {
            const file = findFile(fileId);
            const isActive = activeFileId === fileId;
            const isBlankTab = fileId.startsWith('new-tab-');
            const isWelcomeTab = fileId === 'welcome';

            let tabName = '';
            if (isWelcomeTab) tabName = 'Welcome';
            else if (isBlankTab) tabName = 'Untitled';
            else if (fileId === 'cinder-settings') tabName = 'Settings';
            else if (fileId === 'cinder-info') tabName = 'About';
            else if (fileId === 'cinder-trash') tabName = 'Trash';
            else tabName = file?.name.replace(/\.md$/, '') || 'Unknown';

            return (
              <div
                key={fileId}
                data-no-drag
                data-testid="editor-tab"
                draggable={true}
                onDragStart={(e) => {
                  e.dataTransfer.setData(
                    'application/cinder-tab',
                    JSON.stringify({ fileId, sourcePaneId: paneId })
                  );
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onClick={() => selectFile(fileId)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  showTabContextMenu(fileId, {
                    openFileInNewTab,
                    selectFile,
                    setRenamingFileId,
                    deleteFile,
                    deleteFolder,
                    duplicateFile,
                    createFile,
                    createFileInFolder,
                    createFolder,
                    closeFile,
                    closeOtherFiles,
                    closeAllFiles,
                    findFile,
                    togglePin,
                  });
                }}
                className={`animate-tab-enter group flex items-center min-w-[140px] max-w-[220px] h-full px-4 border-r cursor-pointer text-[12px] font-medium select-none transition-all relative shrink-0`}
                style={{
                  borderColor: 'var(--border-primary)',
                  backgroundColor: isActive
                    ? 'rgba(255, 255, 255, 0.06)'
                    : 'transparent',
                  color: isActive
                    ? 'var(--text-primary)'
                    : 'var(--text-secondary)',
                }}
              >
                {!isWelcomeTab && !fileId.startsWith('cinder-') && (
                  <FileText
                    size={14}
                    className={`mr-2 shrink-0 transition-opacity ${isActive ? 'opacity-100' : 'opacity-40'}`}
                    style={{
                      color: isActive
                        ? 'var(--editor-header-accent)'
                        : 'inherit',
                    }}
                  />
                )}

                {isWelcomeTab && (
                  <Gift
                    size={14}
                    className={`mr-2 shrink-0 transition-opacity ${isActive ? 'opacity-100' : 'opacity-40'}`}
                    style={{
                      color: isActive
                        ? 'var(--editor-header-accent)'
                        : 'inherit',
                    }}
                  />
                )}

                {fileId.startsWith('cinder-') && (
                  <span
                    className={`mr-2 shrink-0 transition-opacity ${isActive ? 'opacity-100' : 'opacity-40'}`}
                    style={{
                      color: isActive
                        ? 'var(--editor-header-accent)'
                        : 'inherit',
                    }}
                  >
                    {fileId === 'cinder-settings' && <Settings size={14} />}
                    {fileId === 'cinder-info' && <Info size={14} />}
                    {fileId === 'cinder-trash' && <Trash2 size={14} />}
                  </span>
                )}

                <span
                  className={`truncate flex-1 ${isBlankTab ? 'italic opacity-60' : ''}`}
                >
                  {tabName}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeFile(fileId);
                  }}
                  className="ml-2 p-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-all hover:bg-[var(--bg-active)]"
                  style={{
                    color: 'var(--text-tertiary)',
                  }}
                  data-testid="tab-close-button"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Right Side Controls - Fixed */}
        <div className="flex items-center h-full px-2 gap-1 shrink-0 z-10">
          {/* New Tab Button */}
          <button
            onClick={createNewTab}
            className="flex items-center justify-center w-[32px] h-[32px] rounded-md transition-colors hover:bg-[var(--bg-hover)]"
            style={{ color: 'var(--text-tertiary)' }}
            title="New Tab"
            data-testid="new-tab-button"
          >
            <Plus size={18} />
          </button>

          {/* Close Pane (only when multiple panes exist) */}
          {hasMultiplePanes && (
            <button
              onClick={() => useSplitStore.getState().closePane(paneId)}
              className="flex items-center justify-center w-[32px] h-[32px] rounded-md transition-colors hover:bg-[var(--bg-hover)]"
              style={{ color: 'var(--text-tertiary)' }}
              title="Close Pane"
              data-testid="close-pane-button"
            >
              <X size={16} />
            </button>
          )}

          {/* Sidebar Toggle */}
          <button
            onClick={toggleExplorerCollapsed}
            className="flex items-center justify-center w-[32px] h-[32px] rounded-md transition-colors hover:bg-[var(--bg-hover)]"
            style={{ color: 'var(--text-tertiary)' }}
            title="Toggle Sidebar"
            data-testid="toggle-sidebar-button"
          >
            <PanelLeft size={16} />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleExplorerCollapsed}
            className="flex items-center justify-center w-[32px] h-[32px] rounded-md transition-colors hover:bg-[var(--bg-hover)]"
            style={{
              color: isExplorerCollapsed
                ? 'var(--editor-header-accent)'
                : 'var(--text-tertiary)',
            }}
            title={
              isExplorerCollapsed ? 'Exit Fullscreen' : 'Fullscreen Editor'
            }
            data-testid="fullscreen-button"
          >
            {isExplorerCollapsed ? (
              <Minimize2 size={16} />
            ) : (
              <Maximize2 size={16} />
            )}
          </button>
        </div>
      </div>
      <div
        className="h-px w-full shrink-0"
        style={{ backgroundColor: 'var(--separator)' }}
      />
    </>
  );
}
