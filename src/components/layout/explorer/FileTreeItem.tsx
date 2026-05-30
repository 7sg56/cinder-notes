import { useState, useEffect, useRef } from 'react';
import type { FileNode } from '../../../types/fileSystem';
import { useAppStore } from '../../../store/useAppStore';
import { VscChevronRight, VscPinned } from 'react-icons/vsc';
import {
  showFileContextMenu,
  showFolderContextMenu,
} from '../../../util/contextMenu';

function formatDate(epochSeconds: number): string {
  const date = new Date(epochSeconds * 1000);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const fileDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const time = date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  if (fileDay.getTime() === today.getTime()) {
    return `Today, ${time}`;
  }
  if (fileDay.getTime() === yesterday.getTime()) {
    return `Yesterday, ${time}`;
  }

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
interface RenameInputProps {
  initialValue: string;
  onRename: (newName: string) => void;
  onCancel: () => void;
}

function RenameInput({ initialValue, onRename, onCancel }: RenameInputProps) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleSubmit = () => {
    onRename(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.stopPropagation();
      handleSubmit();
    } else if (e.key === 'Escape') {
      e.stopPropagation();
      onCancel();
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={handleSubmit}
      onKeyDown={handleKeyDown}
      onClick={(e) => e.stopPropagation()}
      className="vsc-rename-input"
      style={{
        color: 'var(--text-primary)',
        backgroundColor: 'var(--editor-bg)',
        border: '1px solid var(--editor-header-accent)',
        outline: 'none',
        borderRadius: '2px',
        padding: '0 3px',
        fontSize: '13px',
        lineHeight: '22px',
        height: '20px',
        flex: 1,
        minWidth: 0,
      }}
    />
  );
}

interface FileTreeItemProps {
  node: FileNode;
  depth?: number;
  isPinned?: boolean;
}

export function FileTreeItem({
  node,
  depth = 0,
  isPinned = false,
}: FileTreeItemProps) {
  const {
    openFileInNewTab,
    activeFileId,
    renamingFileId,
    setRenamingFileId,
    renameFile,
    expandedFolderIds,
    toggleFolder,
    renameSource,
    moveNode,
    deleteFile,
    deleteFolder,
    duplicateFile,
    createFileInFolder,
    createFolder,
    selectFile,
    closeFile,
    closeOtherFiles,
    closeAllFiles,
    createFile,
    findFile,
    togglePin,
  } = useAppStore();

  // Derived state from store
  const isOpen = expandedFolderIds.includes(node.id);
  const [dragState, setDragState] = useState<{
    isOver: boolean;
    position: 'inside' | 'before' | 'after';
  }>({ isOver: false, position: 'inside' });
  const dragEnterTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    e.dataTransfer.setData('text/plain', node.id);
    e.dataTransfer.effectAllowed = 'move';
    // Visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.4';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    setDragState((prev) => ({ ...prev, isOver: false }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';

    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const height = rect.height;

    let position: 'inside' | 'before' | 'after' = 'inside';

    if (node.type === 'folder') {
      if (isOpen) {
        if (offsetY < height * 0.25) position = 'before';
        else position = 'inside';
      } else {
        if (offsetY < height * 0.25) position = 'before';
        else if (offsetY > height * 0.75) position = 'after';
        else position = 'inside';
      }
    } else {
      if (offsetY < height * 0.5) position = 'before';
      else position = 'after';
    }

    if (!dragState.isOver || dragState.position !== position) {
      setDragState({ isOver: true, position });
    }

    // Auto-expand folder logic
    if (position === 'inside' && node.type === 'folder') {
      if (!isOpen && !dragEnterTimeoutRef.current) {
        dragEnterTimeoutRef.current = setTimeout(() => {
          if (!isOpen) toggleFolder(node.id);
        }, 600);
      }
    } else {
      if (dragEnterTimeoutRef.current) {
        clearTimeout(dragEnterTimeoutRef.current);
        dragEnterTimeoutRef.current = null;
      }
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragState((prev) => ({ ...prev, isOver: false }));

    if (dragEnterTimeoutRef.current) {
      clearTimeout(dragEnterTimeoutRef.current);
      dragEnterTimeoutRef.current = null;
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragState((prev) => ({ ...prev, isOver: false }));

    if (dragEnterTimeoutRef.current) {
      clearTimeout(dragEnterTimeoutRef.current);
      dragEnterTimeoutRef.current = null;
    }

    const sourceId = e.dataTransfer.getData('text/plain');
    if (sourceId && sourceId !== node.id) {
      moveNode(sourceId, node.id, dragState.position);

      // If dropped inside, expand
      if (
        dragState.position === 'inside' &&
        !isOpen &&
        node.type === 'folder'
      ) {
        toggleFolder(node.id);
      }
    }
  };

  // Allow renaming in explorer if it is explicitly an explorer rename (including new files)
  const isRenaming = renamingFileId === node.id && renameSource === 'explorer';

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.type === 'folder') {
      toggleFolder(node.id);
    } else {
      openFileInNewTab(node.id);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.type === 'file') {
      setRenamingFileId(node.id, 'explorer');
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const actions = {
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
    };
    if (node.type === 'folder') {
      showFolderContextMenu(node, actions);
    } else {
      showFileContextMenu(node, actions);
    }
  };

  const finalizeRename = (newName: string) => {
    const trimmed = newName.trim();
    if (trimmed) {
      let finalName = trimmed;
      if (node.type === 'file' && !finalName.endsWith('.md')) {
        finalName += '.md';
      }
      renameFile(node.id, finalName);
    } else {
      setRenamingFileId(null);
    }
  };

  const isActive = activeFileId === node.id;
  const INDENT_SIZE = 16;
  const BASE_PADDING = 12;
  const paddingLeft = BASE_PADDING + depth * INDENT_SIZE;

  return (
    <div data-filetree-item>
      <div className="relative">
        {/* Drop Indicator Logic */}
        {dragState.isOver && dragState.position === 'before' && (
          <div
            className="absolute top-0 left-0 right-0 z-10 pointer-events-none"
            style={{
              height: '2px',
              backgroundColor: 'var(--editor-header-accent)',
            }}
          />
        )}
        {dragState.isOver && dragState.position === 'after' && (
          <div
            className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none"
            style={{
              height: '2px',
              backgroundColor: 'var(--editor-header-accent)',
            }}
          />
        )}

        {/* Indent guides */}
        {depth > 0 && (
          <>
            {Array.from({ length: depth }).map((_, i) => (
              <div
                key={i}
                className="vsc-indent-guide"
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: `${BASE_PADDING + i * INDENT_SIZE + 7}px`,
                  width: '1px',
                  backgroundColor: 'var(--vsc-indent-guide)',
                  pointerEvents: 'none',
                  zIndex: 1,
                }}
              />
            ))}
          </>
        )}

        <div
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          onContextMenu={handleContextMenu}
          draggable={!isRenaming}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="vsc-tree-row"
          style={{
            paddingLeft: `${paddingLeft}px`,
            paddingRight: '16px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            fontSize: '13px',
            lineHeight: '34px',
            userSelect: 'none',
            position: 'relative',
            backgroundColor:
              dragState.isOver && dragState.position === 'inside'
                ? 'var(--filetree-bg-active)'
                : isActive
                  ? 'var(--filetree-bg-active)'
                  : 'transparent',
            color: isActive
              ? 'var(--filetree-text-active)'
              : 'var(--text-secondary)',
          }}
          onMouseEnter={(e) => {
            if (
              !isActive &&
              !(dragState.isOver && dragState.position === 'inside')
            ) {
              e.currentTarget.style.backgroundColor = 'var(--vsc-tree-hover)';
            }
          }}
          onMouseLeave={(e) => {
            if (
              !isActive &&
              !(dragState.isOver && dragState.position === 'inside')
            ) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          {/* Chevron / spacer */}
          <span
            style={{
              width: '16px',
              height: '34px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginRight: '4px',
            }}
          >
            {node.type === 'folder' ? (
              <VscChevronRight
                size={16}
                className={`transition-transform duration-150 ${isOpen ? 'rotate-90' : ''}`}
                style={{ color: 'var(--text-tertiary)' }}
              />
            ) : (
              <span style={{ width: '16px', display: 'inline-block' }} />
            )}
          </span>

          {/* Label */}
          {isRenaming ? (
            <RenameInput
              initialValue={node.name.replace(/\.md$/, '')}
              onRename={finalizeRename}
              onCancel={() => setRenamingFileId(null)}
            />
          ) : (
            <>
              <div
                style={{
                  overflow: 'hidden',
                  flex: 1,
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <span
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontWeight: node.type === 'folder' ? 500 : 400,
                    letterSpacing: '0.01em',
                    color: 'inherit',
                    lineHeight: '16px',
                  }}
                >
                  {node.name.replace(/\.md$/, '')}
                </span>
                {node.type === 'file' && node.modifiedAt && (
                  <span
                    style={{
                      fontSize: '10px',
                      lineHeight: '13px',
                      color: 'var(--text-tertiary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {formatDate(node.modifiedAt)}
                  </span>
                )}
                {node.type === 'folder' && (
                  <span
                    style={{
                      fontSize: '10px',
                      lineHeight: '13px',
                      color: 'var(--text-tertiary)',
                      whiteSpace: 'nowrap',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {node.children?.length ?? 0}{' '}
                    {(node.children?.length ?? 0) === 1 ? 'item' : 'items'}
                  </span>
                )}
              </div>
              {isPinned && (
                <VscPinned
                  size={13}
                  style={{
                    flexShrink: 0,
                    marginLeft: '6px',
                    color: 'var(--editor-header-accent)',
                    opacity: 0.7,
                  }}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Children */}
      {node.type === 'folder' && node.children && (
        <div
          className="grid transition-[grid-template-rows] duration-200 ease-in-out"
          style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
        >
          <div className="overflow-hidden">
            {node.children.map((child) => (
              <FileTreeItem key={child.id} node={child} depth={depth + 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
