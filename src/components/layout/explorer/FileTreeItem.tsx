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
        console.log('[DragStart]', node.id);
        e.dataTransfer.setData('sourceId', node.id);
        e.dataTransfer.effectAllowed = 'move';
        // Visual feedback
        if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.style.opacity = '0.5';
        }
    };

    const handleDragEnd = (e: React.DragEvent) => {
        console.log('[DragEnd]');
        if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.style.opacity = '1';
        }
        setDragState(prev => ({ ...prev, isOver: false }));
    };

    const handleDragOver = (e: React.DragEvent) => {
        if (node.type === 'folder') {
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = 'move';
        } else {
            e.dataTransfer.dropEffect = 'none';
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = 'move';
        }

        const rect = e.currentTarget.getBoundingClientRect();
        const offsetY = e.clientY - rect.top;
        const height = rect.height;

        let position: 'inside' | 'before' | 'after' = 'inside';

        if (node.type === 'folder') {
            if (offsetY < height * 0.25) position = 'before';
            else if (offsetY > height * 0.75) position = 'after';
            else position = 'inside';
        } else {
            // Files can't have 'inside'
            if (offsetY < height * 0.5) position = 'before';
            else position = 'after';
        }

        if (!dragState.isOver || dragState.position !== position) {
            console.log('[DragOver] Change:', position, node.id);
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
        setDragState(prev => ({ ...prev, isOver: false })); // Don't reset position to avoid flickering? keeping it simple for now

        if (dragEnterTimeoutRef.current) {
            clearTimeout(dragEnterTimeoutRef.current);
            dragEnterTimeoutRef.current = null;
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        console.log('[Drop] on', node.id);
        e.preventDefault();
        e.stopPropagation();
        setDragState(prev => ({ ...prev, isOver: false }));

        if (dragEnterTimeoutRef.current) {
            clearTimeout(dragEnterTimeoutRef.current);
            dragEnterTimeoutRef.current = null;
        }

        const sourceId = e.dataTransfer.getData('sourceId');
        console.log('[Drop] sourceId:', sourceId);
        if (sourceId && sourceId !== node.id) {
            console.log('[Drop] Calling moveNode', sourceId, node.id, dragState.position);
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
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                    paddingLeft,
                    // Use active bg if active, OR drag over 'inside' color if matching
                    backgroundColor: dragState.isOver && dragState.position === 'inside'
                        ? 'var(--filetree-bg-hover)' // or even darker?
                        : isActive
                            ? 'var(--filetree-bg-active)'
                            : 'transparent',
                    color: isActive ? 'var(--filetree-text-active)' : 'var(--filetree-text)',

                    // Drag indicators
                    borderTop: dragState.isOver && dragState.position === 'before' ? '2px solid var(--editor-header-accent)' : '2px solid transparent',
                    borderBottom: dragState.isOver && dragState.position === 'after' ? '2px solid var(--editor-header-accent)' : '2px solid transparent',
                    // Outline for 'inside' is optional, maybe just BG is enough. Let's add simple outline for all drag over to see.
                    // Actually, for inside we want the whole box.
                    outline: dragState.isOver && dragState.position === 'inside' ? '1px dashed var(--editor-header-accent)' : 'none',
                    outlineOffset: '-1px'
                }}
                // Removed border-l-2 to fix "bright white border" issue
                className={`group flex items-center py-1.5 cursor-pointer text-[13px] font-medium select-none transition-colors box-border`}
                // Active indicator via border
                // border-transparent normally, accent color if active?
                // Or just keep the background. Let's stick to inline style for simplicity or handle via class logic
                // overriding border color here
                // className border-l-2 border-transparent hover:border-l-2 ...
                // Actually default design doesn't have border-l. Let's just stick to bg.
                onMouseEnter={(e) => {
                    if (!isActive && !dragState.isOver) {
                        e.currentTarget.style.backgroundColor = 'var(--filetree-bg-hover)';
                    }
                }}
                onMouseLeave={(e) => {
                    if (!isActive && !dragState.isOver) {
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
