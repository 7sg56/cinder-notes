import React, { useEffect, useRef } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import { MarkdownPreview } from './MarkdownPreview';
import { Eye, ChevronLeft, FileText, Save } from 'lucide-react';

interface EditorProps {
    isPreview: boolean;
    onPreviewChange?: (isPreview: boolean) => void;
}

export function Editor({ isPreview }: EditorProps) {
    const { activeFileId, activeFileContent, updateFileContent, renamingFileId } = useAppStore();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const prevRenamingFileId = usePrevious(renamingFileId);

    const isBlankTab = activeFileId?.startsWith('new-tab-');

    // Focus editor when renaming finishes
    useEffect(() => {
        // If we were renaming (prevRenamingFileId exists) and now we are not (renamingFileId is null)
        // AND the active file is still the one we were renaming (or just exists)
        if (prevRenamingFileId && !renamingFileId && !isBlankTab && !isPreview) {
            textareaRef.current?.focus();
        }
    }, [renamingFileId, prevRenamingFileId, isBlankTab, isPreview]);

    return (
        <div
            className="h-full flex flex-col relative group transition-colors duration-300"
            style={{ backgroundColor: 'var(--editor-bg)' }}
        >
            {!activeFileId || activeFileId === 'welcome' ? (
                /* --- EMPTY STATE --- */
                <div
                    className="flex-1 flex items-center justify-center"
                    style={{ backgroundColor: 'var(--editor-bg)' }}
                >
                    <div className="text-center max-w-md px-6">

                        <h1 className="mb-2 text-3xl font-bold tracking-tight" style={{ color: 'var(--text-white)' }}>
                            Cinder Notes
                        </h1>
                        <p className="mb-10 text-[11px] uppercase tracking-[0.2em] font-bold opacity-40" style={{ color: 'var(--text-secondary)' }}>
                            Distraction-free writing
                        </p>

                        <div className="space-y-5 text-sm">
                            {[
                                { icon: ChevronLeft, text: "Select a file", highlight: "from the explorer" },
                                { icon: FileText, text: "Markdown", highlight: "format support" },
                                { icon: Eye, text: "Toggle preview", highlight: "to render content" },
                                { icon: Save, text: "Auto-saves", highlight: "locally as you type" }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4 text-left group/item cursor-default">
                                    <div className="p-2 rounded-lg bg-white/5 group-hover/item:bg-[var(--editor-header-accent)]/10 transition-colors">
                                        <item.icon size={16} style={{ color: 'var(--text-secondary)' }} />
                                    </div>
                                    <p style={{ color: 'var(--text-secondary)' }}>
                                        <span style={{ color: 'var(--text-primary)' }} className="font-medium">{item.text}</span> {item.highlight}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                /* --- EDITOR / PREVIEW CONTENT --- */
                <div className="flex-1 relative flex flex-col min-h-0">
                    {isPreview ? (
                        <MarkdownPreview content={activeFileContent} />
                    ) : (
                        <>
                            <style>{`
                                textarea::selection { background-color: var(--editor-selection-bg); color: var(--text-white); }
                                textarea::-webkit-scrollbar { width: 8px; }
                                textarea::-webkit-scrollbar-thumb { background: var(--border-secondary); border-radius: 10px; }
                            `}</style>
                            <textarea
                                ref={textareaRef}
                                className="flex-1 w-full h-full p-10 outline-none resize-none font-mono text-[14px] leading-[1.8] transition-colors"
                                style={{
                                    backgroundColor: 'var(--editor-bg)',
                                    color: 'var(--editor-text)'
                                }}
                                value={activeFileContent}
                                onChange={(e) => updateFileContent(activeFileId, e.target.value)}
                                spellCheck={false}
                                placeholder="Type your markdown here..."
                            />
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

// Hook to track previous value
function usePrevious<T>(value: T): T | undefined {
    const [tuple, setTuple] = React.useState<[T | undefined, T]>([undefined, value]);
    if (tuple[1] !== value) {
        setTuple([tuple[1], value]);
    }
    return tuple[0];
}