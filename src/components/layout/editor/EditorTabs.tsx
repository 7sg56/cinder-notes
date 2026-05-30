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
import { showTabContextMenu } from '../../../util/contextMenu';
import { isMac } from '../../../util/tauri';

export function EditorTabs() {
  const {
    openFiles,
    activeFileId,
    selectFile,
    closeFile,
    findFile,
    createNewTab,
    toggleExplorerCollapsed,
    isExplorerCollapsed,
    openFileInNewTab,
    setRenamingFileId,
    deleteFile,
    deleteFolder,
    duplicateFile,
    createFile,
    createFileInFolder,
    createFolder,
    closeOtherFiles,
    closeAllFiles,
    togglePin,
  } = useAppStore();

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
        <div
          className="flex items-center h-full px-2 gap-1 border-l shrink-0 z-10"
          style={{
            borderColor: 'var(--border-primary)',
          }}
        >
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
