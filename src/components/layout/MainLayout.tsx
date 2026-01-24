import type { ReactNode } from 'react';
import { Panel, Group, Separator } from 'react-resizable-panels';
import { ActivityBar } from './ActivityBar';
import { StatusBar } from './StatusBar';
import { TitleBar } from './TitleBar';

interface MainLayoutProps {
    sidebarContent: ReactNode;
    editorContent: ReactNode;
}

export function MainLayout({ sidebarContent, editorContent }: MainLayoutProps) {
    return (
        <div className="h-screen w-screen flex flex-col bg-[#1e1f1c] text-[#cfcfc2] overflow-hidden">

            <TitleBar />

            {/* Main Content Area */}
            <div className="flex-1 flex min-h-0 relative">

                {/* Resizable Panels */}
                <div className="flex-1 flex min-w-0 h-full">
                    <Group orientation="horizontal">
                        {/* Sidebar Panel */}
                        <Panel id="sidebar" defaultSize={20} minSize={10}>
                            <div className="flex flex-col bg-[#1e1f1c] h-full w-full">
                                {sidebarContent}
                            </div>
                        </Panel>

                        <Separator id="resize-handle" className="w-[4px] bg-[#171717] hover:bg-[#f92672] transition-colors cursor-col-resize z-50 active:bg-[#f92672] flex-shrink-0" />

                        {/* Editor Panel */}
                        <Panel id="editor" defaultSize={80} minSize={30}>
                            <div className="flex flex-col bg-[#272822] h-full w-full">
                                {editorContent}
                            </div>
                        </Panel>
                    </Group>
                </div>

                <ActivityBar />

            </div>

            <StatusBar />

        </div>
    );
}
