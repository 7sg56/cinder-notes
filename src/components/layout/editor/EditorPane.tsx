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

type DropZone = 'left' | 'right' | 'top' | 'bottom' | null;

export function EditorPane({ paneId }: EditorPaneProps) {
  const [isPreview, setIsPreview] = useState(false);
  const [dropZone, setDropZone] = useState<DropZone>(null);
  const activeFileId = useSplitStore(
    (state) => state.panes[paneId]?.activeFileId ?? null
  );
  const isActivePane = useSplitStore((state) => state.activePaneId === paneId);
  const hasMultiplePanes = useSplitStore(
    (state) => state.rootNode.type === 'branch'
  );
  const editorViewRef = useRef<EditorView | null>(null);
  const paneRef = useRef<HTMLDivElement>(null);

  const handlePaneClick = () => {
    useSplitStore.getState().setActivePaneId(paneId);
  };

  // ─── Drop zone detection ──────────────────────────────────────────────
  const getDropZone = (e: React.DragEvent): DropZone => {
    const rect = paneRef.current?.getBoundingClientRect();
    if (!rect) return null;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const w = rect.width;
    const h = rect.height;

    // Edge threshold: 25% of the pane dimension
    const edgeX = w * 0.25;
    const edgeY = h * 0.25;

    if (x < edgeX) return 'left';
    if (x > w - edgeX) return 'right';
    if (y < edgeY) return 'top';
    if (y > h - edgeY) return 'bottom';
    return null; // center = drop into this pane's tabs
  };

  const handleDragOver = (e: React.DragEvent) => {
    const dragData = e.dataTransfer.types.includes('application/cinder-tab');
    if (!dragData) return;

    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropZone(getDropZone(e));
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only reset if we're actually leaving the pane (not entering a child)
    if (paneRef.current && !paneRef.current.contains(e.relatedTarget as Node)) {
      setDropZone(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData('application/cinder-tab');
    if (!raw) {
      setDropZone(null);
      return;
    }

    const { fileId, sourcePaneId } = JSON.parse(raw) as {
      fileId: string;
      sourcePaneId: string;
    };
    const zone = getDropZone(e);
    setDropZone(null);

    const splitStore = useSplitStore.getState();

    if (!zone) {
      // Drop into center = move tab to this pane
      if (sourcePaneId !== paneId) {
        splitStore.paneCloseFile(sourcePaneId, fileId);
        splitStore.paneSelectFile(paneId, fileId);
      }
      return;
    }

    // Drop on edge = create a new split
    const axis: 'horizontal' | 'vertical' =
      zone === 'left' || zone === 'right' ? 'horizontal' : 'vertical';
    const insertBefore = zone === 'left' || zone === 'top';

    splitStore.splitPaneWithFile(
      paneId,
      axis,
      fileId,
      sourcePaneId,
      insertBefore
    );
  };

  // ─── Drop zone overlay indicator ──────────────────────────────────────
  const dropOverlayStyle = (): React.CSSProperties | undefined => {
    if (!dropZone) return undefined;

    const base: React.CSSProperties = {
      position: 'absolute',
      backgroundColor: 'var(--editor-header-accent)',
      opacity: 0.12,
      borderRadius: '6px',
      transition: 'all 100ms ease',
      pointerEvents: 'none',
      zIndex: 50,
    };

    switch (dropZone) {
      case 'left':
        return {
          ...base,
          top: '4px',
          left: '4px',
          bottom: '4px',
          width: '48%',
        };
      case 'right':
        return {
          ...base,
          top: '4px',
          right: '4px',
          bottom: '4px',
          width: '48%',
        };
      case 'top':
        return {
          ...base,
          top: '4px',
          left: '4px',
          right: '4px',
          height: '48%',
        };
      case 'bottom':
        return {
          ...base,
          bottom: '4px',
          left: '4px',
          right: '4px',
          height: '48%',
        };
      default:
        return undefined;
    }
  };

  const overlayStyle = dropOverlayStyle();

  return (
    <div
      ref={paneRef}
      className="flex flex-col h-full w-full"
      data-testid="editor-pane"
      onMouseDown={handlePaneClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        position: 'relative',
        outline:
          isActivePane && hasMultiplePanes
            ? '1px solid color-mix(in srgb, var(--editor-header-accent) 40%, transparent)'
            : 'none',
        outlineOffset: '-1px',
      }}
    >
      {overlayStyle && <div style={overlayStyle} />}
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
