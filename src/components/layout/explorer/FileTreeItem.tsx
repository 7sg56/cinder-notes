import { useState, useEffect, useRef } from 'react';
import type { FileNode } from '../../../data/mockFileSystem';
import { useAppStore } from '../../../store/useAppStore';
import { ChevronRight, FileText, Folder, FolderOpen } from 'lucide-react';

interface FileTreeItemProps {
    node: FileNode;
    depth?: number;
}

export function FileTreeItem({ node, depth = 0 }: FileTreeItemProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { openFileInNewTab, activeFileId, renamingFileId, setRenamingFileId, renameFile } = useAppStore();
    const [renameValue, setRenameValue] = useState(node.name);
    const inputRef = useRef<HTMLInputElement>(null);

    const isRenaming = renamingFileId === node.id;

    useEffect(() => {
        if (isRenaming) {
            setRenameValue(node.name);
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
            setIsOpen(!isOpen);
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
    const paddingLeft = `${depth * 12 + 12}px`;

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
                className={`group flex items-center py-1 cursor-pointer text-[13px] select-none transition-colors`}
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
                <span className="mr-1.5 opacity-80 group-hover:opacity-100 shrink-0">
                    {node.type === 'folder' ? (
                        <ChevronRight
                            size={14}
                            className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
                            style={{ color: 'var(--filetree-icon)' }}
                        />
                    ) : (
                        <span className="w-3.5 inline-block" />
                    )}
                </span>

                <span className="mr-1.5 opacity-70">
                    {node.type === 'folder' ? (
                        isOpen ? <FolderOpen size={14} style={{ color: 'var(--filetree-icon)' }} /> : <Folder size={14} style={{ color: 'var(--filetree-icon)' }} />
                    ) : (
                        <FileText size={14} style={{ color: 'var(--filetree-icon)' }} />
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
