import type { MutableRefObject } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import { useSplitStore } from '../../../store/useSplitStore';
import { MarkdownPreview } from './MarkdownPreview';

import { Settings } from '../../features/settings/Settings';
import { Info } from '../../features/settings/Info';
import { TrashView } from '../../features/trash/TrashView';
import { CodeMirrorEditor } from './CodeMirrorEditor';
import type { EditorView } from '@codemirror/view';

interface EditorProps {
  paneId: string;
  isPreview: boolean;
  onPreviewChange?: (isPreview: boolean) => void;
  editorViewRef?: MutableRefObject<EditorView | null>;
  onCursorChange?: (line: number, col: number) => void;
}

export function Editor({
  paneId,
  isPreview,
  editorViewRef,
  onCursorChange,
}: EditorProps) {
  const activeFileId = useSplitStore(
    (state) => state.panes[paneId]?.activeFileId ?? null
  );
  const activeFileContent = useSplitStore(
    (state) => state.panes[paneId]?.activeFileContent ?? ''
  );
  const isMac = navigator.userAgent.includes('Mac');

  return (
    <div
      className="h-full flex flex-col relative group transition-colors duration-300"
      style={{ backgroundColor: 'var(--editor-bg)' }}
    >
      {!activeFileId ||
      activeFileId === 'welcome' ||
      activeFileId.startsWith('cinder-') ? (
        /* --- SYSTEM TABS & EMPTY STATE --- */
        <div
          className="flex-1 flex w-full h-full relative"
          style={{ backgroundColor: 'var(--editor-bg)' }}
        >
          {activeFileId === 'cinder-settings' && <Settings />}
          {activeFileId === 'cinder-info' && <Info />}
          {activeFileId === 'cinder-trash' && <TrashView />}

          {(!activeFileId || activeFileId === 'welcome') && (
            <div className="flex-1 flex items-center justify-center">
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2.5rem',
                  userSelect: 'none',
                }}
              >
                {/* Watermark logo */}
                <img
                  src="/app-icon.png"
                  alt=""
                  draggable={false}
                  style={{
                    width: 120,
                    height: 120,
                    opacity: 0.25,
                  }}
                />

                {/* Shortcut hints */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem',
                    alignItems: 'flex-end',
                  }}
                >
                  {[
                    {
                      label: 'New File',
                      keys: isMac ? ['\u2318', 'N'] : ['Ctrl', 'N'],
                      action: () => useAppStore.getState().createFile(),
                    },
                    {
                      label: 'Open Folder',
                      keys: isMac ? ['\u2318', 'O'] : ['Ctrl', 'O'],
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      onClick={item.action}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        cursor: item.action ? 'pointer' : 'default',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.72rem',
                          color: 'var(--text-tertiary)',
                          opacity: 1,
                        }}
                      >
                        {item.label}
                      </span>
                      <div
                        style={{
                          display: 'flex',
                          gap: '3px',
                        }}
                      >
                        {item.keys.map((k) => (
                          <kbd
                            key={k}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minWidth: '20px',
                              padding: '2px 5px',
                              fontSize: '0.62rem',
                              fontFamily: 'inherit',
                              color: 'var(--text-tertiary)',
                              opacity: 0.9,
                              background: 'var(--bg-secondary)',
                              border: '1px solid var(--border-primary)',
                              borderRadius: '4px',
                            }}
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* --- EDITOR / PREVIEW CONTENT --- */
        <div className="flex-1 relative flex flex-col min-h-0">
          {isPreview ? (
            <MarkdownPreview content={activeFileContent} />
          ) : (
            <CodeMirrorEditor
              value={activeFileContent}
              onChange={(val) =>
                useSplitStore
                  .getState()
                  .paneUpdateFileContent(paneId, activeFileId!, val)
              }
              editorViewRef={editorViewRef}
              onCursorChange={onCursorChange}
            />
          )}
        </div>
      )}
    </div>
  );
}
