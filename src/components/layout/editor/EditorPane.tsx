import { useRef, useState } from 'react';
import { Editor } from './Editor';
import { EditorTabs } from './EditorTabs';
import { EditorHeader } from './EditorHeader';
import { EditorStatusBar } from './EditorStatusBar';
import { WelcomePage } from '../WelcomePage';
import { useAppStore } from '../../../store/useAppStore';
import type { EditorView } from '@codemirror/view';

export function EditorPane() {
  const { activeFileId, defaultView } = useAppStore();
  const [isPreview, setIsPreview] = useState(defaultView === 'preview');
  const editorViewRef = useRef<EditorView | null>(null);
  const [cursorLine, setCursorLine] = useState(1);
  const [cursorCol, setCursorCol] = useState(1);

  return (
    <div
      className="flex flex-col h-full w-full"
      style={{ backgroundColor: 'var(--bg-secondary)' }}
    >
      <EditorTabs />
      {activeFileId === 'welcome' ? (
        <WelcomePage />
      ) : (
        <>
          <EditorHeader
            isPreview={isPreview}
            onPreviewToggle={() => setIsPreview(!isPreview)}
            editorViewRef={editorViewRef}
          />
          <div className="flex-1 min-h-0 relative">
            <Editor
              isPreview={isPreview}
              editorViewRef={editorViewRef}
              onCursorChange={(line, col) => {
                setCursorLine(line);
                setCursorCol(col);
              }}
            />
          </div>
          <EditorStatusBar
            isPreview={isPreview}
            cursorLine={cursorLine}
            cursorCol={cursorCol}
          />
        </>
      )}
    </div>
  );
}
