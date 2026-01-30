import { useState, useEffect, useRef } from 'react';
import type { FileNode } from '../../../data/mockFileSystem';
import { useAppStore } from '../../../store/useAppStore';
import { VscChevronRight, VscFile, VscFolder, VscFolderOpened } from 'react-icons/vsc';

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
        toggleFolder
    } = useAppStore();

    // Derived state from store
    const isOpen = expandedFolderIds.includes(node.id);

    const [renameValue, setRenameValue] = useState(node.name);
    const inputRef = useRef<HTMLInputElement>(null);

    const isRenaming = renamingFileId === node.id;

    useEffect(() => {
        if (isRenaming) {
            // Wait for render to focus
            setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.focus();
                    inputRef.current.select();
                }
            }, 0);
        }
    }, [isRenaming]);

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
            setRenamingFileId(node.id);
        }
    };

    const handleRenameSubmit = () => {
        if (renameValue.trim()) {
            renameFile(node.id, renameValue.trim());
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

    const isActive = activeFileId === node.id;
    // Increased indentation: 16px per level + 16px base
    const paddingLeft = `${depth * 16 + 16}px`;

    return (
        <div>
            <div
                onClick={handleClick}
                onDoubleClick={handleDoubleClick}
                style={{
                    paddingLeft,
                    backgroundColor: isActive ? 'var(--filetree-bg-active)' : 'transparent',
                    color: isActive ? 'var(--filetree-text-active)' : 'var(--filetree-text)'
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

                <span className="mr-2 opacity-100 shrink-0 flex items-center">
                    {node.type === 'folder' ? (
                        isOpen ? <VscFolderOpened size={16} style={{ color: 'var(--filetree-icon)' }} /> : <VscFolder size={16} style={{ color: 'var(--filetree-icon)' }} />
                    ) : (
                        <VscFile size={16} style={{ color: 'var(--filetree-icon)' }} />
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
                    <span className="truncate font-normal tracking-wide">{node.name}</span>
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
