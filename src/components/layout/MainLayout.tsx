import { useRef, useCallback, useState } from 'react';
// import { ActivityBar } from '../features/activity-bar/ActivityBar';
import { useAppStore } from '../../store/useAppStore';
import { ChevronRight } from 'lucide-react';

interface MainLayoutProps {
    sidebarContent: React.ReactNode;
    editorContent: React.ReactNode;
}

export function MainLayout({ sidebarContent, editorContent }: MainLayoutProps) {
    const {
        isExplorerCollapsed,
        setExplorerCollapsed,
        sidebarWidth,
        setSidebarWidth
    } = useAppStore();

    const isResizingRef = useRef(false);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const [isResizing, setIsResizing] = useState(false);

    const startResizing = useCallback((e: React.MouseEvent) => {
        isResizingRef.current = true;
        setIsResizing(true);
        e.preventDefault();
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';

        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizingRef.current || !sidebarRef.current) return;

            // Calculate width relative to sidebar start
            const sidebarRect = sidebarRef.current.getBoundingClientRect();
            const sidebarLeft = sidebarRect.left;
            const newWidthPx = e.clientX - sidebarLeft;

            const windowWidth = window.innerWidth;
            const computedWidth = (newWidthPx / windowWidth) * 100;

            if (computedWidth < 10) {
                if (!useAppStore.getState().isExplorerCollapsed) {
                    setExplorerCollapsed(true);
                }
            } else {
                if (useAppStore.getState().isExplorerCollapsed) {
                    setExplorerCollapsed(false);
                }
                const constrainedWidth = Math.min(Math.max(computedWidth, 15), 50);
                setSidebarWidth(constrainedWidth);
            }
        };

        const handleMouseUp = () => {
            isResizingRef.current = false;
            setIsResizing(false);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }, [setExplorerCollapsed, setSidebarWidth]);

    const toggleSidebar = () => {
        setExplorerCollapsed(!isExplorerCollapsed);
    };

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

                {/* <ActivityBar /> */}

                {/* Sidebar Area */}
                <div
                    ref={sidebarRef}
                    className="flex flex-col h-full overflow-hidden relative transition-all duration-75 ease-out"
                    style={{
                        width: isExplorerCollapsed ? '50px' : `${sidebarWidth}%`,
                        backgroundColor: 'var(--bg-primary)',
                        transition: isResizing ? 'none' : 'width 200ms ease-in-out'
                    }}
                >
                    {isExplorerCollapsed ? (
                        <div
                            className="w-full h-full flex flex-col items-center py-3 gap-2 transition-colors border-r"
                            style={{
                                borderColor: 'var(--border-secondary)'
                            }}
                        >
                            <button
                                onClick={toggleSidebar}
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
                    ) : (
                        <div className="flex flex-col h-full w-full">
                            {sidebarContent}
                        </div>
                    )}
                </div>

                {/* Resize Handle */}
                <div
                    className={`w-[6px] h-full cursor-col-resize z-50 shrink-0 transition-colors ${isResizing ? 'bg-blue-500 opacity-100' : 'hover:bg-blue-400 hover:opacity-60'}`}
                    style={{
                        backgroundColor: isResizing ? 'var(--accent-primary, #3b82f6)' : 'var(--border-primary)',
                    }}
                    onMouseDown={startResizing}
                    onDoubleClick={toggleSidebar}
                />

                {/* Editor Area */}
                <div
                    className="flex-1 min-w-0 h-full flex flex-col"
                    style={{ backgroundColor: 'var(--bg-secondary)' }}
                >
                    {editorContent}
                </div>
            </div>
        </div>
    );
}
