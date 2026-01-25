
import { X, Plus } from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';

export function EditorTabs() {
    const { openFiles, activeFileId, selectFile, closeFile, findFile } = useAppStore();

    if (openFiles.length === 0) return null;

    return (
        <div 
            className="flex overflow-x-auto no-scrollbar shrink-0 border-b"
            style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-primary)'
            }}
        >
            {openFiles.map(fileId => {
                const file = findFile(fileId);
                const isActive = activeFileId === fileId;
                if (!file) return null;

                return (
                    <div
                        key={fileId}
                        onClick={() => selectFile(fileId)}
                        className={`group flex items-center min-w-[120px] max-w-[200px] h-[35px] px-3 border-r cursor-pointer text-[13px] select-none transition-colors`}
                        style={{
                            borderColor: 'var(--border-primary)',
                            backgroundColor: isActive ? 'var(--bg-secondary)' : 'transparent',
                            color: isActive ? 'var(--text-white)' : 'var(--text-tertiary)'
                        }}
                        onMouseEnter={(e) => {
                            if (!isActive) {
                                e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isActive) {
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }
                        }}
                    >
                        <span className="truncate flex-1 mr-2">{file.name}</span>
                        <span
                            onClick={(e) => { e.stopPropagation(); closeFile(fileId); }}
                            className={`opacity-0 group-hover:opacity-100 p-0.5 rounded transition-colors`}
                            style={{
                                color: isActive ? 'var(--text-white)' : 'var(--text-tertiary)'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <X size={12} />
                        </span>
                    </div>
                )
            })}
            <button
                className="flex items-center justify-center h-[35px] px-3 transition-colors"
                style={{
                    color: 'var(--text-tertiary)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
                title="New Tab"
            >
                <Plus size={16} />
            </button>
        </div>
    )
}
