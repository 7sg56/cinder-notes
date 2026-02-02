import { useState, useEffect, useRef } from 'react';
import type { FileNode } from '../../../data/mockFileSystem';
import { useAppStore } from '../../../store/useAppStore';
import { VscChevronRight } from 'react-icons/vsc';


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
            className="flex-1 bg-transparent border border-[var(--editor-header-accent)] rounded-sm outline-none px-1 py-0 text-[13px] leading-none min-w-0"
            style={{ color: 'var(--text-primary)' }}
        />
    );
}

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
    const [dragState, setDragState] = useState<{ isOver: boolean; position: 'inside' | 'before' | 'after' }>({ isOver: false, position: 'inside' });
    const dragEnterTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        setDragState(prev => ({ ...prev, isOver: false }));
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
            // Folder zones:
            if (isOpen) {
                // If expanded, dropping 'after' the header is confusing (looks like first child, acts like sibling after tree).
                // So we force 'inside' for the bottom part.
                if (offsetY < height * 0.25) position = 'before';
                else position = 'inside';
            } else {
                if (offsetY < height * 0.25) position = 'before';
                else if (offsetY > height * 0.75) position = 'after';
                else position = 'inside';
            }
        } else {
            // File zones: Top 50% -> before, Bottom 50% -> after
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
        setDragState(prev => ({ ...prev, isOver: false }));

        if (dragEnterTimeoutRef.current) {
            clearTimeout(dragEnterTimeoutRef.current);
            dragEnterTimeoutRef.current = null;
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragState(prev => ({ ...prev, isOver: false }));

        if (dragEnterTimeoutRef.current) {
            clearTimeout(dragEnterTimeoutRef.current);
            dragEnterTimeoutRef.current = null;
        }

        const sourceId = e.dataTransfer.getData('text/plain');
        if (sourceId && sourceId !== node.id) {
            moveNode(sourceId, node.id, dragState.position);

            // If dropped inside, expand
            if (dragState.position === 'inside' && !isOpen && node.type === 'folder') {
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
    const paddingLeft = `${depth * 16 + 16}px`;

    return (
        <div>
            <div
                className="relative" // Container for absolute indicators
            >
                {/* Drop Indicator Logic: Absolute positioned lines to avoid layout shift */}
                {dragState.isOver && dragState.position === 'before' && (
                    <div className="absolute top-0 left-0 right-0 h-[2px] z-10 bg-[var(--editor-header-accent)] pointer-events-none" />
                )}
                {dragState.isOver && dragState.position === 'after' && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] z-10 bg-[var(--editor-header-accent)] pointer-events-none" />
                )}

                <div
                    onClick={handleClick}
                    onDoubleClick={handleDoubleClick}
                    draggable={!isRenaming}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    style={{
                        paddingLeft,
                        // Background logic: Active gets priority, but drag 'inside' overrides it
                        backgroundColor: dragState.isOver && dragState.position === 'inside'
                            ? 'var(--filetree-bg-active)' // Or a specific hover color
                            : isActive
                                ? 'var(--filetree-bg-active)'
                                : 'transparent',
                        color: isActive ? 'var(--filetree-text-active)' : 'var(--filetree-text)',
                        // Remove borders from here
                    }}
                    className={`group flex items-center py-1.5 cursor-pointer text-[13px] font-medium select-none transition-colors box-border`}
                    onMouseEnter={(e) => {
                        if (!isActive && !(dragState.isOver && dragState.position === 'inside')) {
                            e.currentTarget.style.backgroundColor = 'var(--filetree-bg-hover)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!isActive && !(dragState.isOver && dragState.position === 'inside')) {
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
                        <RenameInput
                            initialValue={node.name.replace(/\.md$/, '')}
                            onRename={finalizeRename}
                            onCancel={() => setRenamingFileId(null)}
                        />
                    ) : (
                        <span
                            className={`truncate font-normal tracking-wide ${node.type === 'folder' ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-secondary)]'}`}
                        >
                            {node.name.replace(/\.md$/, '')}
                        </span>
                    )}
                </div>
            </div>

            {node.type === 'folder' && isOpen && node.children && (
                <div className="">
                    {node.children.map((child) => (
                        <FileTreeItem key={child.id} node={child} depth={depth + 1} /> // Recursive rendering
                    ))}
                </div>
            )}
        </div>
    );
}
