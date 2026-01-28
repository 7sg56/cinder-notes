import { useState } from 'react';
import { Editor } from './Editor';
import { EditorTabs } from './EditorTabs';
import { EditorHeader } from './EditorHeader';
import { EditorStatusBar } from './EditorStatusBar';

export function EditorPane() {
    const [isPreview, setIsPreview] = useState(false);

    return (
        <div 
            className="flex flex-col h-full w-full"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
            <EditorTabs />
            <EditorHeader isPreview={isPreview} onPreviewToggle={() => setIsPreview(!isPreview)} />
            <div className="flex-1 min-h-0 relative">
                <Editor isPreview={isPreview} />
            </div>
            <EditorStatusBar isPreview={isPreview} />
        </div>
    );
}
