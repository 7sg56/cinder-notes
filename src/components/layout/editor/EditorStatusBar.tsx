import { GitBranch } from 'lucide-react';
import { EditorStatusBarItem } from './EditorStatusBarItem';

export function EditorStatusBar() {
    return (
        <div 
            className="h-[22px] border-t text-[11px] font-medium tracking-wide flex items-center justify-between px-2 select-none z-10"
            style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-tertiary)'
            }}
        >
            <div className="flex items-center h-full">
                <EditorStatusBarItem>
                    <GitBranch size={10} className="mr-1" />
                    main*
                </EditorStatusBarItem>
            </div>
            <div className="flex items-center h-full gap-2">
                <EditorStatusBarItem>Ln 12, Col 42</EditorStatusBarItem>
                <EditorStatusBarItem>Markdown</EditorStatusBarItem>
            </div>
        </div>
    );
}
