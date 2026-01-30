import { useEffect } from 'react';
import { Panel, Group, Separator, usePanelRef, useGroupRef } from 'react-resizable-panels';
import { ActivityBar } from '../features/activity-bar/ActivityBar';
import { useAppStore } from '../../store/useAppStore';
import { ChevronRight } from 'lucide-react';

interface MainLayoutProps {
    sidebarContent: React.ReactNode;
    editorContent: React.ReactNode;
}

export function MainLayout({ sidebarContent, editorContent }: MainLayoutProps) {
    const {
        isExplorerCollapsed,
        toggleExplorerCollapsed,
        setExplorerCollapsed,
        sidebarWidth,
        setSidebarWidth
    } = useAppStore();

    const panelRef = usePanelRef();
    const groupRef = useGroupRef();

    // Sync collapsed state with imperative API via Panel Ref
    useEffect(() => {
        const panel = panelRef.current;
        if (!panel) return;

        if (isExplorerCollapsed) {
            panel.collapse();
        } else {
            panel.expand();
        }
    }, [isExplorerCollapsed, sidebarWidth, groupRef]);

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

                <ActivityBar />

                {/* Collapsed Sidebar Strip - Moved outside Group */}
                {isExplorerCollapsed && (
                    <div
                        className="w-[35px] shrink-0 flex flex-col items-center py-3 gap-2 transition-colors border-r"
                        style={{
                            backgroundColor: 'var(--bg-primary)',
                            borderColor: 'var(--border-secondary)'
                        }}
                    >
                        <button
                            onClick={() => {
                                toggleExplorerCollapsed();
                            }}
                            className="p-2 rounded transition-colors group bg-blue-500 hover:bg-blue-600 text-white"
                            style={{
                                color: 'white',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                            title="Expand Explorer"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                )}

                {/* Resizable Panels */}
                <div className="flex-1 flex min-w-0 h-full">
                    <Group
                        groupRef={groupRef}
                        orientation="horizontal"
                        onLayoutChanged={(layout) => {
                            const sidebarSize = layout['sidebar'];
                            if (typeof sidebarSize === 'number' && sidebarSize > 0) {
                                setSidebarWidth(sidebarSize);
                                setExplorerCollapsed(false);
                            }
                        }}
                        onLayoutChanged={() => {
                            const layout = groupRef.current?.getLayout();
                            const finalSidebarSize = layout?.['sidebar'];

                            if (typeof finalSidebarSize === 'number') {
                                if (finalSidebarSize < 5) {
                                    setExplorerCollapsed(true);
                                } else {
                                    if (isExplorerCollapsed) setExplorerCollapsed(false);
                                    setSidebarWidth(sidebarSize);
                                }
                            }
                        }}
                    >
                        {/* Sidebar Panel */}
                        <Panel
                            id="sidebar"
                            panelRef={panelRef}
                            defaultSize={`${sidebarWidth}`}
                            minSize="20"
                            maxSize="30"
                            collapsible={true}
                            collapsedSize={0}
                        >
                            <div
                                className="flex flex-col h-full w-full overflow-hidden relative"
                                style={{
                                    backgroundColor: 'var(--bg-primary)'
                                }}
                            >
                                {/* Collapse button at top of sidebar */}
                                <div className="flex justify-end p-2">
                                    <button
                                        onClick={() => {
                                            console.log('Collapse button clicked');
                                            toggleExplorerCollapsed();
                                        }}
                                        className="p-1.5 rounded bg-red-500 hover:bg-red-600 text-white transition-colors"
                                        title="Collapse Explorer"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                </div>

                                {sidebarContent}
                            </div>
                        </Panel>

                        {/* Resize Handle */}
                        <Separator
                            id="resize-handle"
                            className={`w-[6px] transition-colors cursor-col-resize z-50 shrink-0 ${isExplorerCollapsed ? 'hidden' : ''
                                } hover:bg-blue-400 hover:opacity-60`}
                            style={{
                                backgroundColor: 'var(--border-primary)',
                            }}
                            onDoubleClick={() => {
                                toggleExplorerCollapsed();
                            }}
                        />

                        {/* Editor Panel */}
                        <Panel id="editor" minSize={10}>
                            <div
                                className="flex flex-col h-full w-full"
                                style={{ backgroundColor: 'var(--bg-secondary)' }}
                            >
                                {editorContent}
                            </div>
                        </Panel>
                    </Group>
                </div>



            </div>

        </div>
    );
}
