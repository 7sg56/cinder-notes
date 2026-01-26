import { useAppStore } from '../../../store/useAppStore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Eye, ChevronLeft, FileText, Save, Sparkles } from 'lucide-react';

interface EditorProps {
    isPreview: boolean;
    onPreviewChange?: (isPreview: boolean) => void;
}

export function Editor({ isPreview }: EditorProps) {
    const { activeFileId, activeFileContent, updateFileContent } = useAppStore();

    // Check if this is a blank tab
    const isBlankTab = activeFileId?.startsWith('new-tab-');

    // If no active file, just show empty state in main area
    // Tabs are now handled by EditorPane

    return (
        <div 
            className="h-full flex flex-col relative group"
            style={{ backgroundColor: 'var(--editor-bg)' }}
        >


            {!activeFileId || isBlankTab ? (
                <div 
                    className="flex-1 flex items-center justify-center"
                    style={{
                        backgroundColor: 'var(--editor-bg)',
                        color: 'var(--text-tertiary)'
                    }}
                >
                    <div className="text-center">
                        <div className="mb-6 flex justify-center">
                            <Sparkles size={32} className="text-[#cfcfc2] opacity-70" />
                        </div>
                        <p className="mb-6 text-2xl font-semibold opacity-60">Cinder Notes</p>
                        <div className="space-y-4 text-sm opacity-50 max-w-md">
                            <div className="flex items-center gap-3 justify-center">
                                <ChevronLeft size={18} className="text-[#cfcfc2]" />
                                <p><span className="text-[#cfcfc2]">Select a file</span> from the explorer to start editing</p>
                            </div>
                            <div className="flex items-center gap-3 justify-center">
                                <FileText size={18} className="text-[#cfcfc2]" />
                                <p><span className="text-[#cfcfc2]">Create new notes</span> in Markdown format</p>
                            </div>
                            <div className="flex items-center gap-3 justify-center">
                                <Eye size={18} className="text-[#cfcfc2]" />
                                <p><span className="text-[#cfcfc2]">Toggle preview mode</span> to see rendered content</p>
                            </div>
                            <div className="flex items-center gap-3 justify-center">
                                <Save size={18} className="text-[#cfcfc2]" />
                                <p><span className="text-[#cfcfc2]">Auto-saves</span> as you type</p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 relative flex flex-col min-h-0">
                    {isPreview ? (
                        <div className="flex-1 w-full h-full p-8 overflow-y-auto prose prose-invert prose-stone max-w-none" style={{ color: 'var(--editor-text)' }}>
                            <style>{`
                        .prose h1, .prose h2, .prose h3, .prose h4 { color: var(--markdown-heading); }
                        .prose a { color: var(--markdown-link); }
                        .prose code { color: var(--markdown-code); background: var(--markdown-code-bg); padding: 2px 4px; border-radius: 4px; }
                        .prose pre { background: var(--markdown-code-bg); }
                        .prose strong { color: var(--markdown-strong); }
                        .prose ul > li::marker { color: var(--markdown-list); }
                    `}</style>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {activeFileContent}
                            </ReactMarkdown>
                        </div>
                    ) : (
                        <>
                            <style>{`
                                textarea::selection {
                                    background-color: var(--editor-selection-bg);
                                }
                            `}</style>
                            <textarea
                                className="flex-1 w-full h-full p-8 outline-none resize-none font-mono text-[14px] leading-relaxed"
                                style={{
                                    backgroundColor: 'var(--editor-bg)',
                                    color: 'var(--editor-text)'
                                }}
                                value={activeFileContent}
                                onChange={(e) => updateFileContent(activeFileId, e.target.value)}
                                spellCheck={false}
                                placeholder="Start writing..."
                            />
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
