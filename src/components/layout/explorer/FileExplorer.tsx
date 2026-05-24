import { useState, useMemo, useRef, useEffect } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import type { FileNode } from '../../../types/fileSystem';
import { FileTreeItem } from './FileTreeItem';
import { showExplorerContextMenu } from '../../../util/contextMenu';

import { VscSearch } from 'react-icons/vsc';
import { Plus, FileText, FolderPlus, Settings, Trash2 } from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewMenu, setShowNewMenu] = useState(false);
  const newMenuRef = useRef<HTMLDivElement>(null);

  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return files;
    return filterNodes(files, searchQuery.trim());
  }, [files, searchQuery]);

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
    <div className="h-full flex flex-col">
      {/* Drag region spacer for macOS traffic lights */}
      <div data-tauri-drag-region className="h-[46px] shrink-0 select-none" />

      {/* Search bar + New button */}
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
          />
        </div>

        {/* + button with dropdown */}
        <div className="relative" ref={newMenuRef}>
          <button
            onClick={() => setShowNewMenu(!showNewMenu)}
            className="h-[30px] w-[30px] flex items-center justify-center rounded-full transition-colors hover:bg-[var(--bg-hover)]"
            style={{ color: 'var(--text-secondary)' }}
            title="New..."
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
              >
                <FolderPlus size={14} />
                New Folder
              </button>
            </div>
          )}
        </div>
      </div>

      {/* File tree */}
      <div
        className="flex-1 overflow-y-auto no-scrollbar pt-0 px-2 pb-2"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
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
          <div className="px-4 py-4 text-center text-[12px] opacity-50 select-none">
            No matches found
          </div>
        ) : (
          <div>
            {/* Pinned Files Section */}
            {!searchQuery.trim() && pinnedFiles.length > 0 && (
              <div className="mb-2">
                <div className="px-2 py-1 flex items-center gap-1.5 opacity-60">
                  <span className="text-[10px] font-bold tracking-wider uppercase">
                    Pinned Notes
                  </span>
                </div>
                {pinnedFiles.map((fileId) => {
                  const node = findFile(fileId, files);
                  if (!node) return null;
                  return (
                    <FileTreeItem
                      key={`pinned-${node.id}`}
                      node={node}
                      isPinnedItem
                    />
                  );
                })}
              </div>
            )}

            {!searchQuery.trim() && pinnedFiles.length > 0 && (
              <div className="px-2 py-1 flex items-center gap-1.5 opacity-60 mt-1">
                <span className="text-[10px] font-bold tracking-wider uppercase">
                  All Notes
                </span>
              </div>
            )}

            {filteredFiles.map((node) => (
              <FileTreeItem key={node.id} node={node} />
            ))}
          </div>
        )}
      </div>

      {/* Bottom: Settings & Trash */}
      <div className="shrink-0 flex items-center justify-between px-3 py-2 select-none">
        <button
          onClick={() => openSystemTab('cinder-settings')}
          className="h-[28px] w-[28px] flex items-center justify-center rounded-md transition-colors hover:bg-[var(--bg-hover)]"
          style={{ color: 'var(--text-tertiary)' }}
          title="Settings"
        >
          <Settings size={15} strokeWidth={2} />
        </button>
        <button
          onClick={() => openSystemTab('cinder-trash')}
          className="h-[28px] w-[28px] flex items-center justify-center rounded-md transition-colors hover:bg-[var(--bg-hover)]"
          style={{ color: 'var(--text-tertiary)' }}
          title="Trash"
        >
          <Trash2 size={15} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
