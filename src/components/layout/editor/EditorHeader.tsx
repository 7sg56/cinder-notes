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
            className="flex items-center justify-between px-6 py-3 shrink-0 border-b"
            style={{
                backgroundColor: 'var(--editor-bg)' ,
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
        className="flex items-center gap-2 px-2 py-1 transition-all duration-200 hover:opacity-100 opacity-70"
        style={{ color: isPreview ? 'var(--editor-header-accent)' : 'var(--text-secondary)' }}
    >
        {isPreview ? <Edit2 size={14} /> : <Eye size={14} />}
        <span className="text-[10px] uppercase font-bold tracking-widest">
            {isPreview ? "Edit" : "Preview"}
        </span>
    </button>

    {/* Updated More Button - Turns FFFFFF on hover */}
    <button
        className="flex items-center justify-center p-1.5 rounded-md transition-all duration-300 active:scale-95 shadow-lg shadow-[#f48c25]/10 group/more"
        style={{ 
            backgroundColor: 'var(--editor-header-accent)' 
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--editor-header-accent)';
        }}
    >
        <MoreVertical 
            size={18} 
            className="transition-colors duration-300"
            style={{ color: '#ffffff' }} 
            onMouseEnter={(e) => {
                // This ensures the icon color changes to orange when the parent is white
                (e.target as HTMLElement).style.color = 'var(--editor-header-accent)';
            }}
            // We can also use a CSS class approach for cleaner icon color flipping:
        />
        <style>{`
            .group more:hover svg {
                color: var(--editor-header-accent) !important;
            }
        `}</style>
    </button>
</div>
        </div>
    );
}