import { useRef, useEffect } from 'react';
import { Undo2, Redo2, Eye, Edit2, MoreVertical } from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';

interface EditorHeaderProps {
    isPreview: boolean;
    onPreviewToggle: () => void;
}

export function EditorHeader({ isPreview, onPreviewToggle }: EditorHeaderProps) {
    const { activeFileId, getFileBreadcrumb, renamingFileId, pendingFileId, renameFile, cancelRename, setRenamingFileId, renameSource } = useAppStore();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (renamingFileId && renameSource === 'editor' && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [renamingFileId, renameSource]);

    const isBlankTab = activeFileId?.startsWith('new-tab-');
    const breadcrumb = activeFileId && !isBlankTab ? getFileBreadcrumb(activeFileId) : [];

    if (!activeFileId) return null;

    return (
        <div
            className="flex items-center justify-between px-6 py-2 shrink-0 border-b"
            style={{
                backgroundColor: 'var(--editor-bg)',
                borderColor: 'rgba(255, 255, 255, 0.05)',
            }}
        >
            {/* Left side: Breadcrumb path */}
            <div className="flex items-center gap-2 flex-1 justify-start">
                {activeFileId.startsWith('new-tab-') && (
                    <div className="flex items-center gap-2.5 text-[10px] font-bold select-none">
                        {renamingFileId === activeFileId && renameSource === 'editor' ? (
                            <input
                                ref={inputRef}
                                autoFocus
                                defaultValue="Untitled"
                                className="bg-transparent outline-none font-bold px-1 py-0.5 rounded border border-[var(--editor-header-accent)]"
                                style={{
                                    color: 'var(--text-primary)',
                                    caretColor: '#f48c25',
                                    width: `${Math.max(3, "Untitled".length + 1)}ch`,
                                    minWidth: '20px'
                                }}
                                onInput={(e) => {
                                    const target = e.currentTarget;
                                    target.style.width = `${Math.max(3, target.value.length + 1)}ch`;
                                }}
                                onBlur={(e) => {
                                    const newName = e.target.value.trim();
                                    if (newName && newName !== 'Untitled') {
                                        renameFile(activeFileId, newName + '.md');
                                    } else {
                                        setRenamingFileId(null);
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const newName = e.currentTarget.value.trim();
                                        if (newName) {
                                            renameFile(activeFileId, newName + '.md');
                                        }
                                    } else if (e.key === 'Escape') {
                                        e.preventDefault();
                                        cancelRename();
                                    }
                                }}
                                onClick={(e) => e.stopPropagation()}
                                onDoubleClick={(e) => e.stopPropagation()}
                            />
                        ) : (
                            <span
                                className="cursor-text hover:text-[var(--editor-header-accent)] transition-colors duration-200"
                                style={{ color: 'var(--text-primary)' }}
                                onDoubleClick={(e) => {
                                    e.stopPropagation();
                                    setRenamingFileId(activeFileId, 'editor');
                                }}
                            >
                                Untitled
                            </span>
                        )}
                        <span style={{ color: '#f48c25', opacity: 0.5 }}>&gt;</span>
                    </div>
                )}
                {!isBlankTab && breadcrumb.length > 0 && (
                    <div className="flex items-center gap-2.5 text-[10px] font-bold select-none">
                        {breadcrumb.map((item, index) => {
                            // Only the last item (the active file) should be editable
                            const isEditable = index === breadcrumb.length - 1 && item.id === activeFileId;

                            return (
                                <div key={item.id} className="flex items-center gap-2.5">
                                    {index > 0 && <span style={{ color: '#f48c25', opacity: 0.5 }}>&gt;</span>}
                                    {renamingFileId === item.id && renameSource === 'editor' ? (
                                        <input
                                            ref={inputRef}
                                            // AutoFocus is handled by useEffect for reliability
                                            defaultValue={item.name.replace(/\.md$/, '')}
                                            className="bg-transparent outline-none font-bold px-1 py-0.5 rounded border border-[var(--editor-header-accent)]"
                                            style={{
                                                color: 'var(--text-primary)',
                                                caretColor: '#f48c25',
                                                width: `${Math.max(3, item.name.replace(/\.md$/, '').length + 1)}ch`,
                                                minWidth: '20px'
                                            }}
                                            onInput={(e) => {
                                                const target = e.currentTarget;
                                                target.style.width = `${Math.max(3, target.value.length + 1)}ch`;
                                            }}
                                            // onFocus managed by useEffect
                                            onBlur={(e) => {
                                                const currentName = e.target.value.trim();
                                                if (pendingFileId === item.id) {
                                                    // User clicked away (e.g. into editor) -> Save the file instead of deleting
                                                    if (currentName) {
                                                        const finalName = currentName.endsWith('.md') ? currentName : currentName + '.md';
                                                        renameFile(item.id, finalName);
                                                    } else {
                                                        renameFile(item.id, 'untitled.md');
                                                    }
                                                } else {
                                                    setRenamingFileId(null);
                                                }
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    const newName = e.currentTarget.value.trim();
                                                    if (newName) {
                                                        const finalName = newName.endsWith('.md') ? newName : newName + '.md';
                                                        renameFile(item.id, finalName);
                                                    }
                                                } else if (e.key === 'Escape') {
                                                    e.preventDefault();
                                                    cancelRename();
                                                }
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            onDoubleClick={(e) => e.stopPropagation()}
                                        />
                                    ) : (
                                        <span
                                            className={`transition-colors duration-200 ${isEditable ? 'cursor-text hover:text-[var(--editor-header-accent)]' : 'cursor-default'}`}
                                            onDoubleClick={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                if (isEditable) {
                                                    setRenamingFileId(item.id, 'editor');
                                                }
                                            }}
                                            style={{
                                                color: item.type === 'file' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                                                opacity: isEditable ? 1 : 0.7
                                            }}
                                        >
                                            {item.type === 'file' ? item.name.replace(/\.md$/, '') : item.name}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Right side: Refined Actions */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 mr-1">
                    <button
                        className="p-1.5 rounded-md transition-all duration-200 hover:bg-[var(--bg-hover)] active:scale-90"
                        style={{ color: 'var(--text-tertiary)' }} // Swapped #444 for variable
                    >
                        <Undo2 size={15} strokeWidth={2} />
                    </button>
                    <button
                        className="p-1.5 rounded-md transition-all duration-200 hover:bg-[var(--bg-hover)] active:scale-90"
                        style={{ color: 'var(--text-tertiary)' }} // Swapped #444 for variable
                    >
                        <Redo2 size={15} strokeWidth={2} />
                    </button>
                </div>

                <div className="w-px h-3" style={{ backgroundColor: 'var(--border-primary)' }} />

                <button
                    onClick={onPreviewToggle}
                    className="flex items-center justify-center p-1.5 rounded-md transition-all duration-200 hover:bg-[var(--bg-hover)] active:scale-90"
                    title={isPreview ? "Edit" : "Preview"}
                    style={{ color: isPreview ? 'var(--editor-header-accent)' : 'var(--text-secondary)' }}
                >
                    {isPreview ? <Edit2 size={16} /> : <Eye size={16} />}
                </button>

                {/* Updated More Button - Subtle style matching theme */}
                <button
                    className="flex items-center justify-center p-1.5 rounded-md transition-all duration-200 hover:bg-[var(--bg-hover)] active:scale-95"
                    style={{
                        color: 'var(--text-secondary)'
                    }}
                >
                    <MoreVertical size={16} />
                </button>
            </div>
        </div>
    );
}