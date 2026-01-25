import { Editor } from './Editor';
import { EditorTabs } from './EditorTabs';
import { EditorStatusBar } from './EditorStatusBar';

export function EditorPane() {
    return (
        <div 
            className="flex flex-col h-full w-full"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
            <EditorTabs />
            <div className="flex-1 min-h-0 relative">
                <Editor />
            </div>
            <EditorStatusBar />
        </div>
    );
}
