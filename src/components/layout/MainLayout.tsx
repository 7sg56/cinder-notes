import { useRef, useCallback, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
// import { ActivityBar } from '../features/activity-bar/ActivityBar';
import { useAppStore } from '../../store/useAppStore';
import { useWorkspace } from '../../hooks/useWorkspace';

interface MainLayoutProps {
  sidebarContent: React.ReactNode;
  editorContent: React.ReactNode;
}

export function MainLayout({ sidebarContent, editorContent }: MainLayoutProps) {
  const {
    isExplorerCollapsed,
    setExplorerCollapsed,
    sidebarWidth,
    setSidebarWidth,
    isDraggingFiles,
    setDraggingFiles,
    workspacePath,
  } = useAppStore();

  const isResizingRef = useRef(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const { refreshWorkspace } = useWorkspace();

  const startResizing = useCallback(
    (e: React.MouseEvent) => {
      isResizingRef.current = true;
      setIsResizing(true);
      e.preventDefault();
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      const handleMouseMove = (e: MouseEvent) => {
        if (!isResizingRef.current || !sidebarRef.current) return;

        // Calculate width relative to sidebar start
        const sidebarRect = sidebarRef.current.getBoundingClientRect();
        const sidebarLeft = sidebarRect.left;
        const newWidthPx = e.clientX - sidebarLeft;

        const windowWidth = window.innerWidth;
        const computedWidth = (newWidthPx / windowWidth) * 100;

        if (computedWidth < 12) {
          if (!useAppStore.getState().isExplorerCollapsed) {
            setExplorerCollapsed(true);
          }
        } else {
          if (useAppStore.getState().isExplorerCollapsed) {
            setExplorerCollapsed(false);
          }
          const constrainedWidth = Math.min(Math.max(computedWidth, 15), 50);
          setSidebarWidth(constrainedWidth);
        }
      };

      const handleMouseUp = () => {
        isResizingRef.current = false;
        setIsResizing(false);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [setSidebarWidth, setExplorerCollapsed]
  );

  const toggleSidebar = () => {
    setExplorerCollapsed(!isExplorerCollapsed);
  };

  const handleWindowDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const hasFiles =
      e.dataTransfer.types &&
      Array.from(e.dataTransfer.types).includes('Files');
    if (hasFiles) {
      e.dataTransfer.dropEffect = 'copy';
    }
  };

  const handleWindowDragLeave = (e: React.DragEvent) => {
    // Only hide when leaving the window entirely
    if (e.currentTarget === e.target) {
      setDraggingFiles(false);
    }
  };

  const handleWindowDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingFiles(false);

    const hasFiles =
      e.dataTransfer.types &&
      Array.from(e.dataTransfer.types).includes('Files');

    if (hasFiles && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (!workspacePath) return;

      const filesArr = Array.from(e.dataTransfer.files);
      let importedAny = false;

      for (const file of filesArr) {
        if (file.name.toLowerCase().endsWith('.md')) {
          try {
            const content = await file.text();
            const targetPath = `${workspacePath}/${file.name}`;
            await invoke('write_note', { path: targetPath, content });
            importedAny = true;
          } catch (err) {
            console.error('Failed to import dropped file:', err);
          }
        }
      }

      if (importedAny) {
        await refreshWorkspace();
      }
    }
  };

  return (
    <div
      className="h-screen w-screen flex flex-col overflow-hidden relative"
      style={{
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}
      onDragOver={handleWindowDragOver}
      onDragLeave={handleWindowDragLeave}
      onDrop={handleWindowDrop}
    >
      {/* Full Window Drag Overlay */}
      {isDraggingFiles && (
        <div
          className="absolute inset-0 z-[9999] flex items-center justify-center pointer-events-none"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(6px)',
          }}
        >
          <div
            className="px-12 py-8 rounded-xl border-2 border-dashed"
            style={{
              borderColor: 'var(--accent-primary)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
            }}
          >
            <p className="text-xl font-medium">Drop files here</p>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex min-h-0 relative">
        {/* <ActivityBar /> */}

        {/* Sidebar Area */}
        <div
          ref={sidebarRef}
          className="flex flex-col h-full overflow-hidden relative transition-all duration-75 ease-out"
          style={{
            width: isExplorerCollapsed ? '0px' : `${sidebarWidth}%`,
            backgroundColor: 'var(--bg-primary)',
            transition: isResizing ? 'none' : 'width 200ms ease-in-out',
          }}
        >
          <div className="flex flex-col h-full w-full min-w-[200px]">
            {sidebarContent}
          </div>
        </div>

        {/* Resize Handle */}
        <div
          className={`w-[6px] h-full cursor-col-resize z-50 shrink-0 transition-colors ${isResizing ? 'bg-blue-500 opacity-100' : 'hover:bg-blue-400 hover:opacity-60'}`}
          style={{
            backgroundColor: isResizing
              ? 'var(--accent-primary, #3b82f6)'
              : 'var(--border-primary)',
          }}
          onMouseDown={startResizing}
          onDoubleClick={toggleSidebar}
        />

        {/* Editor Area */}
        <div
          className="flex-1 min-w-0 h-full flex flex-col"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          {editorContent}
        </div>
      </div>
    </div>
  );
}
