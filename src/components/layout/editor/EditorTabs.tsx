import { X, Plus, FileText, Sparkles } from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';

export function EditorTabs() {
    const { openFiles, activeFileId, selectFile, closeFile, findFile, createNewTab } = useAppStore();

    return (
        <div
            className="flex overflow-x-auto no-scrollbar shrink-0 border-b transition-colors duration-300"
            style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)',
                minHeight: '40px'
            }}
        >
            {openFiles.map(fileId => {
                const file = findFile(fileId);
                const isActive = activeFileId === fileId;
                const isBlankTab = fileId.startsWith('new-tab-');
                const isWelcomeTab = fileId === 'welcome';
                const tabName = isWelcomeTab ? 'Welcome' : (isBlankTab ? 'Untitled' : file?.name.replace(/\.md$/, ''));

                return (
                    <div
                        key={fileId}
                        onClick={() => selectFile(fileId)}
                        className={`group flex items-center min-w-[140px] max-w-[220px] h-[40px] px-4 border-r cursor-pointer text-[12px] font-medium select-none transition-all relative`}
                        style={{
                            borderColor: 'var(--border-primary)',
                            backgroundColor: isActive ? 'var(--bg-primary)' : 'transparent',
                            color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                        }}
                    >
                        {/* Orange top border removed from here */}

                        {isWelcomeTab ? (
                            <Sparkles
                                size={14}
                                className={`mr-2 shrink-0 transition-opacity ${isActive ? 'opacity-100' : 'opacity-40'}`}
                                style={{
                                    color: isActive ? 'var(--editor-header-accent)' : 'inherit'
                                }}
                            />
                        ) : (
                            <FileText
                                size={14}
                                className={`mr-2 shrink-0 transition-opacity ${isActive ? 'opacity-100' : 'opacity-40'}`}
                                style={{
                                    // Accent is now only on the icon for a cleaner look
                                    color: isActive ? 'var(--editor-header-accent)' : 'inherit'
                                }}
                            />
                        )}

                        <span className={`truncate flex-1 ${isBlankTab ? 'italic opacity-60' : ''}`}>
                            {tabName}
                        </span>

                        <button
                            onClick={(e) => { e.stopPropagation(); closeFile(fileId); }}
                            className="ml-2 p-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-all hover:bg-white/10"
                            style={{
                                color: 'var(--text-tertiary)'
                            }}
                        >
                            <X size={14} />
                        </button>
                    </div>
                );
            })}

            <button
                onClick={createNewTab}
                className="flex items-center justify-center w-[40px] h-[40px] shrink-0 transition-colors hover:bg-white/5"
                style={{ color: 'var(--text-tertiary)' }}
                title="New Tab"
            >
                <Plus size={18} />
            </button>
        </div>
    );
}