import { GitBranch } from 'lucide-react';
import { EditorStatusBarItem } from './EditorStatusBarItem';

export function EditorStatusBar() {
    return (
        <div className="h-[22px] bg-[#1e1f1c] border-t border-[#171717] text-[#75715e] flex items-center justify-between px-2 select-none z-10 text-[11px] font-medium tracking-wide">
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
