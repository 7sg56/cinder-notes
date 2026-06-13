import { useState, useMemo, useRef, useEffect } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import type { FileNode } from '../../../types/fileSystem';
import { FileTreeItem } from './FileTreeItem';
import { showExplorerContextMenu } from '../../../util/contextMenu';

import { VscSearch } from 'react-icons/vsc';
import { Plus, FileText, FolderPlus, Settings, Trash2 } from 'lucide-react';
import { isMac } from '../../../util/tauri';

// Helper to filter nodes recursively
const filterNodes = (nodes: FileNode[], query: string): FileNode[] => {
  if (!query) return nodes;

  return nodes.reduce((acc, node) => {
    if (node.type === 'file') {
      if (node.name.toLowerCase().includes(query.toLowerCase())) {
        acc.push(node);
      }
    } else if (node.type === 'folder') {
      const filteredChildren = node.children
        ? filterNodes(node.children, query)
        : [];

      const matchesName = node.name.toLowerCase().includes(query.toLowerCase());

      if (matchesName || filteredChildren.length > 0) {
        acc.push({ ...node, children: filteredChildren });
      }
    }
    return acc;
  }, [] as FileNode[]);
};

// Sort nodes so pinned files bubble to the top, preserving relative order otherwise
const sortWithPinnedFirst = (
  nodes: FileNode[],
  pinnedSet: Set<string>
): FileNode[] => {
  const pinned: FileNode[] = [];
  const rest: FileNode[] = [];

  for (const node of nodes) {
    if (pinnedSet.has(node.id)) {
      pinned.push(node);
    } else {
      rest.push(node);
    }
  }

  return [...pinned, ...rest];
};

export function FileExplorer() {
  const {
    files,
    createFile,
    moveNode,
    openFileInNewTab,
    selectFile,
    setRenamingFileId,
    deleteFile,
    deleteFolder,
    duplicateFile,
    createFileInFolder,
    createFolder,
    closeFile,
    closeOtherFiles,
    closeAllFiles,
    findFile,
    togglePin,
    pinnedFiles,
    openSystemTab,
  } = useAppStore();

  const workspacePath = useAppStore((s) => s.workspacePath);
  const workspaceName = workspacePath
    ? workspacePath.split('/').pop() ||
      workspacePath.split('\\').pop() ||
      'Workspace'
    : 'Explorer';

  const [searchQuery, setSearchQuery] = useState('');
  const [showNewMenu, setShowNewMenu] = useState(false);
  const newMenuRef = useRef<HTMLDivElement>(null);

  const pinnedSet = useMemo(() => new Set(pinnedFiles), [pinnedFiles]);

  const filteredFiles = useMemo(() => {
    const base = searchQuery.trim()
      ? filterNodes(files, searchQuery.trim())
      : files;
    return sortWithPinnedFirst(base, pinnedSet);
  }, [files, searchQuery, pinnedSet]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!showNewMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (
        newMenuRef.current &&
        !newMenuRef.current.contains(e.target as Node)
      ) {
        setShowNewMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showNewMenu]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const sourceId = e.dataTransfer.getData('text/plain');
    if (sourceId) {
      moveNode(sourceId, 'root', 'root');
    }
  };

  return (
    <div
      className="h-full flex flex-col"
      style={{ backgroundColor: 'var(--bg-primary)' }}
      data-testid="file-explorer"
    >
      {/* Drag region spacer for macOS traffic lights / Windows top padding */}
      <div
        data-tauri-drag-region
        className={isMac() ? 'h-[46px]' : 'h-[8px]'}
        style={{ flexShrink: 0 }}
      />

      {/* Search bar + New button (original Cinder style) */}
      <div className="shrink-0 px-3 pb-3 flex items-center gap-1.5">
        <div
          className="flex-1 min-w-0 flex items-center h-[30px] rounded-full px-3 gap-2 transition-colors focus-within:bg-[var(--bg-secondary)]"
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid transparent',
          }}
        >
          <VscSearch size={13} style={{ color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="flex-1 bg-transparent border-none outline-none text-[12px] placeholder:text-[var(--text-tertiary)] min-w-0"
            style={{ color: 'var(--text-primary)' }}
            data-testid="explorer-search"
          />
        </div>

        {/* + button with dropdown */}
        <div className="relative" ref={newMenuRef}>
          <button
            onClick={() => setShowNewMenu(!showNewMenu)}
            className="h-[30px] w-[30px] flex items-center justify-center rounded-full transition-colors hover:bg-[var(--bg-hover)]"
            style={{ color: 'var(--text-secondary)' }}
            title="New..."
            data-testid="explorer-add-button"
          >
            <Plus size={16} strokeWidth={2.5} />
          </button>

          {showNewMenu && (
            <div
              className="absolute right-0 top-[34px] z-50 min-w-[150px] py-1 rounded-lg shadow-lg"
              style={{
                backgroundColor: 'var(--editor-bg)',
                border: '1px solid var(--separator)',
              }}
            >
              <button
                onClick={() => {
                  createFile();
                  setShowNewMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] transition-colors hover:bg-[var(--bg-hover)]"
                style={{ color: 'var(--text-secondary)' }}
                data-testid="explorer-new-note"
              >
                <FileText size={14} />
                New Note
              </button>
              <button
                onClick={() => {
                  createFolder();
                  setShowNewMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] transition-colors hover:bg-[var(--bg-hover)]"
                style={{ color: 'var(--text-secondary)' }}
                data-testid="explorer-new-folder"
              >
                <FolderPlus size={14} />
                New Folder
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Workspace section header */}
      <div
        className="vsc-section-header"
        style={{
          height: '26px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 14px',
          userSelect: 'none',
          fontWeight: 700,
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          color: 'var(--text-secondary)',
          backgroundColor: 'transparent',
          flexShrink: 0,
        }}
      >
        {workspaceName}
      </div>

      {/* File tree */}
      <div
        className="flex-1 overflow-y-auto no-scrollbar"
        style={{ paddingTop: '2px', paddingBottom: '2px' }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        data-testid="file-tree"
        onContextMenu={(e) => {
          if (
            e.target === e.currentTarget ||
            (e.target as HTMLElement).closest('[data-filetree-item]') === null
          ) {
            e.preventDefault();
            showExplorerContextMenu({
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
          }
        }}
      >
        {filteredFiles.length === 0 ? (
          <div
            style={{
              padding: '16px',
              textAlign: 'center',
              fontSize: '12px',
              opacity: 0.5,
              userSelect: 'none',
              color: 'var(--text-tertiary)',
            }}
            data-testid="file-tree-empty"
          >
            {searchQuery.trim() ? 'No matches found' : 'No files yet'}
          </div>
        ) : (
          filteredFiles.map((node) => (
            <FileTreeItem
              key={node.id}
              node={node}
              isPinned={pinnedSet.has(node.id)}
            />
          ))
        )}
      </div>

      {/* Bottom: Settings & Trash */}
      <div className="shrink-0 select-none" style={{}}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '36px',
            padding: '0 8px',
          }}
        >
          <button
            onClick={() => openSystemTab('cinder-settings')}
            className="vsc-icon-btn"
            title="Settings"
            data-testid="sidebar-settings-button"
            style={{
              width: '26px',
              height: '26px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-tertiary)',
              cursor: 'pointer',
            }}
          >
            <Settings size={15} strokeWidth={2} />
          </button>
          <button
            onClick={() => openSystemTab('cinder-trash')}
            className="vsc-icon-btn"
            title="Trash"
            data-testid="sidebar-trash-button"
            style={{
              width: '26px',
              height: '26px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-tertiary)',
              cursor: 'pointer',
            }}
          >
            <Trash2 size={15} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}
