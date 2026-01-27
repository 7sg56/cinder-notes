import type { ReactNode } from 'react';
import { Panel, Group, Separator } from 'react-resizable-panels';
import { ActivityBar } from './ActivityBar';
import { useAppStore } from '../../store/useAppStore';
import { ChevronRight } from 'lucide-react';

interface MainLayoutProps {
    sidebarContent: ReactNode;
    editorContent: ReactNode;
}

export function MainLayout({ sidebarContent, editorContent }: MainLayoutProps) {
    const { isExplorerCollapsed, toggleExplorerCollapsed } = useAppStore();

    return (
        <div 
            className="h-screen w-screen flex flex-col overflow-hidden"
            style={{
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)'
            }}
        >

            {/* Main Content Area */}
            <div className="flex-1 flex min-h-0 relative">

                {/* Resizable Panels */}
                <div className="flex-1 flex min-w-0 h-full">
                    <Group orientation="horizontal">
                        {/* Sidebar Panel */}
                        {!isExplorerCollapsed && (
                            <>
                                <Panel id="sidebar" defaultSize={20} minSize={10} collapsible={true} collapsedSize={0}>
                                    <div 
                                        className="flex flex-col h-full w-full"
                                        style={{ backgroundColor: 'var(--bg-primary)' }}
                                    >
                                        {sidebarContent}
                                    </div>
                                </Panel>

                                <Separator 
                                    id="resize-handle" 
                                    className="w-[4px] transition-colors cursor-col-resize z-50 flex-shrink-0" 
                                    style={{
                                        backgroundColor: 'var(--border-primary)',
                                    }}
                                />
                            </>
                        )}

                        {/* Collapsed Sidebar - VS Code Style */}
                        {isExplorerCollapsed && (
                            <div 
                                className="w-[35px] flex-shrink-0 flex flex-col items-center py-3 gap-2 transition-colors"
                                style={{
                                    backgroundColor: 'var(--bg-primary)',
                                    borderRight: '1px solid var(--border-secondary)'
                                }}
                            >
                                <button
                                    onClick={() => toggleExplorerCollapsed()}
                                    className="p-2 rounded transition-colors group"
                                    style={{
                                        color: 'var(--text-primary)',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    title="Explorer"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        )}

                        {/* Editor Panel */}
                        <Panel id="editor" defaultSize={isExplorerCollapsed ? 95 : 80} minSize={30}>
                            <div 
                                className="flex flex-col h-full w-full"
                                style={{ backgroundColor: 'var(--bg-secondary)' }}
                            >
                                {editorContent}
                            </div>
                        </Panel>
                    </Group>
                </div>

                <ActivityBar />

            </div>

        </div>
    );
}
