import { X, Plus, FileText, Sparkles, PanelLeft } from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';

export function EditorTabs() {
    const { openFiles, activeFileId, selectFile, closeFile, findFile, createNewTab, toggleExplorerCollapsed } = useAppStore();

    return (
        <div
            className="flex items-center shrink-0 border-b relative"
            style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)',
                height: '40px'
            }}
        >
            {/* Tabs List - Takes available space */}
            <div className="flex-1 flex overflow-x-auto no-scrollbar h-full">
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
                            className={`group flex items-center min-w-[140px] max-w-[220px] h-full px-4 border-r cursor-pointer text-[12px] font-medium select-none transition-all relative shrink-0`}
                            style={{
                                borderColor: 'var(--border-primary)',
                                backgroundColor: isActive ? 'var(--bg-primary)' : 'transparent',
                                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                            }}
                        >
                            {!isWelcomeTab && (
                                <FileText
                                    size={14}
                                    className={`mr-2 shrink-0 transition-opacity ${isActive ? 'opacity-100' : 'opacity-40'}`}
                                    style={{
                                        color: isActive ? 'var(--editor-header-accent)' : 'inherit'
                                    }}
                                />
                            )}

                            {isWelcomeTab && (
                                <Sparkles
                                    size={14}
                                    className={`mr-2 shrink-0 transition-opacity ${isActive ? 'opacity-100' : 'opacity-40'}`}
                                    style={{
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
            </div>

            {/* Right Side Controls - Fixed */}
            <div className="flex items-center h-full px-2 gap-1 border-l shrink-0 z-10"
                style={{
                    borderColor: 'var(--border-primary)',
                    backgroundColor: 'var(--bg-secondary)'
                }}
            >
                {/* New Tab Button */}
                <button
                    onClick={createNewTab}
                    className="flex items-center justify-center w-[32px] h-[32px] rounded-md transition-colors hover:bg-white/5"
                    style={{ color: 'var(--text-tertiary)' }}
                    title="New Tab"
                >
                    <Plus size={18} />
                </button>

                {/* Sidebar Toggle */}
                <button
                    onClick={toggleExplorerCollapsed}
                    className="flex items-center justify-center w-[32px] h-[32px] rounded-md transition-colors hover:bg-white/5"
                    style={{ color: 'var(--text-tertiary)' }}
                    title="Toggle Sidebar"
                >
                    <PanelLeft size={16} />
                </button>

                {/* Cinder Icon */}
                <div className="flex items-center justify-center w-[32px] h-[32px] opacity-80 hover:opacity-100 transition-opacity">
                    <img
                        src="/icons/128%20x%20128.svg"
                        alt="Cinder"
                        className="w-full h-full object-contain"
                    />
                </div>
            </div>
        </div>
    );
}