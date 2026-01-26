import { Undo2, Redo2, Eye, Edit2 } from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';

interface EditorHeaderProps {
    isPreview: boolean;
    onPreviewToggle: () => void;
}

export function EditorHeader({ isPreview, onPreviewToggle }: EditorHeaderProps) {
    const { activeFileId, findFile } = useAppStore();

    // Check if this is a blank tab
    const isBlankTab = activeFileId?.startsWith('new-tab-');
    const file = activeFileId && !isBlankTab ? findFile(activeFileId) : null;
    const tabName = isBlankTab ? 'New Tab' : file?.name || '';

    // Only show header if there's an active file or blank tab
    if (!activeFileId) return null;

    return (
        <div
            className="flex items-center justify-between px-2 py-1.5 shrink-0"
            style={{
                backgroundColor: 'var(--editor-bg)',
                borderColor: 'var(--border-primary)'
            }}
        >
            {/* Left side: Undo/Redo buttons */}
            <div className="flex items-center gap-1">
                <button
                    className="p-1.5 rounded cursor-pointer transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                    title="Undo"
                >
                    <Undo2 size={16} />
                </button>
                <button
                    className="p-1.5 rounded cursor-pointer transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                    title="Redo"
                >
                    <Redo2 size={16} />
                </button>
            </div>

            {/* Center: Tab name */}
            <span 
                className="text-[13px] font-medium flex-1 text-center"
                style={{ 
                    color: 'var(--text-primary)',
                    fontStyle: isBlankTab ? 'italic' : 'normal'
                }}
            >
                {tabName}
            </span>

            {/* Right side: Preview toggle button */}
            <button
                onClick={onPreviewToggle}
                className="p-1.5 rounded cursor-pointer transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                }}
                title={isPreview ? "Edit" : "Preview"}
            >
                {isPreview ? <Edit2 size={16} /> : <Eye size={16} />}
            </button>
        </div>
    );
}
