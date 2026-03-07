import type { MutableRefObject } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import { MarkdownPreview } from './MarkdownPreview';
import { Eye, ChevronLeft, FileText, Save } from 'lucide-react';

import { Settings } from '../../features/settings/Settings';
import { Info } from '../../features/settings/Info';
import { CodeMirrorEditor } from './CodeMirrorEditor';
import type { EditorView } from '@codemirror/view';

interface EditorProps {
  isPreview: boolean;
  onPreviewChange?: (isPreview: boolean) => void;
  editorViewRef?: MutableRefObject<EditorView | null>;
  onCursorChange?: (line: number, col: number) => void;
}

export function Editor({
  isPreview,
  editorViewRef,
  onCursorChange,
}: EditorProps) {
  const { activeFileId, activeFileContent, updateFileContent } = useAppStore();

  return (
    <div
      className="h-full flex flex-col relative group transition-colors duration-300"
      style={{ backgroundColor: 'var(--editor-bg)' }}
    >
      {!activeFileId ||
        activeFileId === 'welcome' ||
        activeFileId.startsWith('cinder-') ? (
        /* --- SYSTEM TABS & EMPTY STATE --- */
        <div className="flex-1 flex w-full h-full relative bg-[var(--bg-primary)]">

          {activeFileId === 'cinder-settings' && <Settings />}
          {activeFileId === 'cinder-info' && <Info />}

          {(!activeFileId || activeFileId === 'welcome') && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md px-6 z-10">
                <h1
                  className="mb-2 text-3xl font-bold tracking-tight"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Cinder Notes
                </h1>
                <p
                  className="mb-10 text-[11px] uppercase tracking-[0.2em] font-bold opacity-40"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Distraction-free writing
                </p>

                <div className="space-y-5 text-sm">
                  {[
                    {
                      icon: ChevronLeft,
                      text: 'Select a file',
                      highlight: 'from the explorer',
                    },
                    {
                      icon: FileText,
                      text: 'Markdown',
                      highlight: 'format support',
                    },
                    {
                      icon: Eye,
                      text: 'Toggle preview',
                      highlight: 'to render content',
                    },
                    {
                      icon: Save,
                      text: 'Auto-saves',
                      highlight: 'locally as you type',
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 text-left group/item cursor-default"
                    >
                      <div
                        className="p-2 rounded-lg transition-colors hover:bg-[var(--bg-active)]"
                        style={{ backgroundColor: 'var(--bg-hover)' }}
                      >
                        <item.icon
                          size={16}
                          style={{ color: 'var(--text-secondary)' }}
                        />
                      </div>
                      <p style={{ color: 'var(--text-secondary)' }}>
                        <span
                          style={{ color: 'var(--text-primary)' }}
                          className="font-medium"
                        >
                          {item.text}
                        </span>{' '}
                        {item.highlight}
                      </p>
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
              onChange={(val) => updateFileContent(activeFileId, val)}
              editorViewRef={editorViewRef}
              onCursorChange={onCursorChange}
            />
          )}
        </div>
      )}
    </div>
  );
}
