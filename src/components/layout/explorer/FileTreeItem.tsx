import { useState, useEffect, useRef } from 'react';
import type { FileNode } from '../../../data/mockFileSystem';
import { useAppStore } from '../../../store/useAppStore';
import { VscChevronRight } from 'react-icons/vsc';

interface FileTreeItemProps {
    node: FileNode;
    depth?: number;
}

export function FileTreeItem({ node, depth = 0 }: FileTreeItemProps) {
    const {
        openFileInNewTab,
        activeFileId,
        renamingFileId,
        setRenamingFileId,
        renameFile,
        expandedFolderIds,
        toggleFolder,
        renameSource,
        moveNode
    } = useAppStore();

    // Derived state from store
    const isOpen = expandedFolderIds.includes(node.id);

    // Initialize with name minus extension
    const [renameValue, setRenameValue] = useState(node.name.replace(/\.md$/, ''));
    const [isDragOver, setIsDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Allow renaming in explorer if it is explicitly an explorer rename (including new files)
    const isRenaming = renamingFileId === node.id && renameSource === 'explorer';

    useEffect(() => {
        if (isRenaming) {
            // Reset value when entering rename mode
            setRenameValue(node.name.replace(/\.md$/, ''));
            // Wait for render to focus
            setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.focus();
                    inputRef.current.select();
                }
            }, 0);
        }
    }, [isRenaming, node.name]);

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

    const handleRenameSubmit = () => {
        const trimmed = renameValue.trim();
        if (trimmed) {
            // Re-append extension if it's a file and doesn't have it
            let finalName = trimmed;
            if (node.type === 'file' && !finalName.endsWith('.md')) {
                finalName += '.md';
            }
            renameFile(node.id, finalName);
        } else {
            setRenamingFileId(null); // Cancel if empty
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleRenameSubmit();
        } else if (e.key === 'Escape') {
            setRenamingFileId(null);
            setRenameValue(node.name);
        }
    };

    // Drag and Drop Handlers
    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('sourceId', node.id);
        e.dataTransfer.effectAllowed = 'move';
        // Add some transparency or visual feedback if desired
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // Necessary to allow dropping
        e.stopPropagation();

        // Only allow dropping into folders
        if (node.type === 'folder') {
            e.dataTransfer.dropEffect = 'move';
            setIsDragOver(true);

            // Expand folder on hover (optional, maybe with delay?)
            // For now, let's just highlight
        } else {
            e.dataTransfer.dropEffect = 'none';
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        const sourceId = e.dataTransfer.getData('sourceId');
        if (sourceId && sourceId !== node.id) {
            moveNode(sourceId, node.id);
            // Auto-expand the target folder if it was closed
            if (!isOpen) {
                toggleFolder(node.id);
            }
        }
    };

    const isActive = activeFileId === node.id;
    // Increased indentation: 16px per level + 16px base
    const paddingLeft = `${depth * 16 + 16}px`;

    return (
        <div>
            <div
                onClick={handleClick}
                onDoubleClick={handleDoubleClick}
                draggable={!isRenaming} // Allow dragging unless renaming
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                    paddingLeft,
                    // Use active bg if active, OR drag over color if drag over
                    backgroundColor: isDragOver
                        ? 'var(--filetree-bg-hover)' // or a specific drop target color
                        : isActive
                            ? 'var(--filetree-bg-active)'
                            : 'transparent',
                    color: isActive ? 'var(--filetree-text-active)' : 'var(--filetree-text)',
                    // Add border for drag over visibility
                    outline: isDragOver ? '1px dashed var(--editor-header-accent)' : 'none',
                    outlineOffset: '-1px'
                }}
                // Removed border-l-2 to fix "bright white border" issue
                className={`group flex items-center py-1.5 cursor-pointer text-[13px] font-medium select-none transition-colors`}
                // Active indicator via border
                // border-transparent normally, accent color if active?
                // Or just keep the background. Let's stick to inline style for simplicity or handle via class logic
                // overriding border color here
                // className border-l-2 border-transparent hover:border-l-2 ...
                // Actually default design doesn't have border-l. Let's just stick to bg.
                onMouseEnter={(e) => {
                    if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'var(--filetree-bg-hover)';
                    }
                }}
                onMouseLeave={(e) => {
                    if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }
                }}
            >
                <span className="mr-1.5 opacity-80 group-hover:opacity-100 shrink-0 flex items-center justify-center w-4">
                    {node.type === 'folder' ? (
                        <VscChevronRight
                            size={14}
                            className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
                            style={{ color: 'var(--filetree-icon)' }}
                        />
                    ) : (
                        <span className="w-4 inline-block" />
                    )}
                </span>

                {isRenaming ? (
                    <input
                        ref={inputRef}
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={handleRenameSubmit}
                        onKeyDown={handleKeyDown}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 bg-transparent border border-[var(--editor-header-accent)] rounded-sm outline-none px-1 py-0 text-[13px] leading-none min-w-0"
                        style={{ color: 'var(--text-primary)' }}
                    />
                ) : (
                    <span
                        className={`truncate font-normal tracking-wide ${node.type === 'folder' ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-secondary)]'}`}
                    >
                        {node.name.replace(/\.md$/, '')}
                    </span>
                )}
            </div>

            {node.type === 'folder' && isOpen && node.children && (
                <div className="">
                    {node.children.map((child) => (
                        <FileTreeItem key={child.id} node={child} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}
