import { useRef, useState } from 'react';
import { Editor } from './Editor';
import { EditorTabs } from './EditorTabs';
import { EditorHeader } from './EditorHeader';
import { WelcomePage } from '../WelcomePage';
import { useSplitStore } from '../../../store/useSplitStore';
import type { EditorView } from '@codemirror/view';

interface EditorPaneProps {
  paneId: string;
}

export function EditorPane({ paneId }: EditorPaneProps) {
  const [isPreview, setIsPreview] = useState(false);
  const activeFileId = useSplitStore(
    (state) => state.panes[paneId]?.activeFileId ?? null
  );
  const isActivePane = useSplitStore((state) => state.activePaneId === paneId);
  const editorViewRef = useRef<EditorView | null>(null);

  const handlePaneClick = () => {
    useSplitStore.getState().setActivePaneId(paneId);
  };

  return (
    <div
      className="flex flex-col h-full w-full"
      data-testid="editor-pane"
      onMouseDown={handlePaneClick}
      style={{
        borderTop: isActivePane
          ? '2px solid var(--editor-header-accent)'
          : '2px solid transparent',
      }}
    >
      <EditorTabs paneId={paneId} />
      {activeFileId === 'welcome' ? (
        <WelcomePage />
      ) : (
        <>
          <EditorHeader
            paneId={paneId}
            isPreview={isPreview}
            onPreviewToggle={() => setIsPreview(!isPreview)}
            editorViewRef={editorViewRef}
          />
          <div className="flex-1 min-h-0 relative">
            <Editor
              paneId={paneId}
              isPreview={isPreview}
              editorViewRef={editorViewRef}
            />
          </div>
        </>
      )}
    </div>
  );
}
