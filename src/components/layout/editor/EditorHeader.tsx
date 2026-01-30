import { Undo2, Redo2, Eye, Edit2, MoreVertical } from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';

interface EditorHeaderProps {
    isPreview: boolean;
    onPreviewToggle: () => void;
}

export function EditorHeader({ isPreview, onPreviewToggle }: EditorHeaderProps) {
    const { activeFileId, getFileBreadcrumb } = useAppStore();

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
                {!isBlankTab && breadcrumb.length > 0 && (
                    <div className="flex items-center gap-2.5 text-[10px] uppercase tracking-[0.15em] font-bold">
                        {breadcrumb.map((item, index) => (
                            <div key={item.id} className="flex items-center gap-2.5">
                                {index > 0 && <span style={{ color: '#f48c25', opacity: 0.5 }}>&gt;</span>}
                                <span
                                    className="transition-colors duration-200"
                                    style={{
                                        color: item.type === 'file' ? '#ffffff' : '#555555',
                                    }}
                                >
                                    {item.type === 'file' ? item.name.split('.').slice(0, -1).join('.') : item.name}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Right side: Refined Actions */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 mr-1">
                    <button
                        className="p-1.5 rounded-md transition-all duration-200 hover:bg-white/5 active:scale-90"
                        style={{ color: 'var(--text-tertiary)' }} // Swapped #444 for variable
                    >
                        <Undo2 size={15} strokeWidth={2} />
                    </button>
                    <button
                        className="p-1.5 rounded-md transition-all duration-200 hover:bg-white/5 active:scale-90"
                        style={{ color: 'var(--text-tertiary)' }} // Swapped #444 for variable
                    >
                        <Redo2 size={15} strokeWidth={2} />
                    </button>
                </div>

                <div className="w-px h-3" style={{ backgroundColor: 'var(--border-primary)' }} />

                <button
                    onClick={onPreviewToggle}
                    className="flex items-center justify-center p-1.5 rounded-md transition-all duration-200 hover:bg-white/5 active:scale-90"
                    title={isPreview ? "Edit" : "Preview"}
                    style={{ color: isPreview ? 'var(--editor-header-accent)' : 'var(--text-secondary)' }}
                >
                    {isPreview ? <Edit2 size={16} /> : <Eye size={16} />}
                </button>

                {/* Updated More Button - Subtle style matching theme */}
                <button
                    className="flex items-center justify-center p-1.5 rounded-md transition-all duration-200 hover:bg-white/10 active:scale-95"
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