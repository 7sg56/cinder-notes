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

    const isBlankTab = activeFileId?.startsWith('new-tab-');

    return (
        <div 
            className="h-full flex flex-col relative group transition-colors duration-300"
            style={{ backgroundColor: 'var(--editor-bg)' }}
        >
            {!activeFileId || isBlankTab ? (
                /* --- EMPTY STATE --- */
                <div 
                    className="flex-1 flex items-center justify-center"
                    style={{ backgroundColor: 'var(--editor-bg)' }}
                >
                    <div className="text-center max-w-md px-6">
                        <div className="mb-8 flex justify-center">
                            <div className="p-4 rounded-2xl bg-[var(--editor-header-accent)]/5 border border-[var(--editor-header-accent)]/10">
                                <Sparkles size={40} style={{ color: 'var(--editor-header-accent)' }} className="opacity-80" />
                            </div>
                        </div>
                        
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
                        <div className="flex-1 w-full h-full p-10 overflow-y-auto prose prose-invert max-w-none scrollbar-thin" style={{ color: 'var(--editor-text)' }}>
                            <style>{`
                                .prose h1, .prose h2, .prose h3, .prose h4 { color: var(--markdown-heading); font-weight: 700; border-bottom: 1px solid var(--border-secondary); padding-bottom: 0.3em; }
                                .prose a { color: var(--markdown-link); text-decoration: none; border-bottom: 1px solid transparent; transition: border-color 0.2s; }
                                .prose a:hover { border-color: var(--markdown-link); }
                                .prose code { color: var(--markdown-code); background: var(--markdown-code-bg); padding: 0.2em 0.4em; border-radius: 6px; font-size: 0.9em; }
                                .prose pre { background: var(--markdown-code-bg); border: 1px solid var(--border-secondary); border-radius: 8px; }
                                .prose strong { color: var(--markdown-strong); }
                                .prose ul > li::marker { color: var(--markdown-list); }
                                .prose blockquote { border-left-color: var(--editor-header-accent); background: var(--bg-secondary); padding: 1rem; border-radius: 0 8px 8px 0; }
                            `}</style>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {activeFileContent}
                            </ReactMarkdown>
                        </div>
                    ) : (
                        <>
                            <style>{`
                                textarea::selection { background-color: var(--editor-selection-bg); color: var(--text-white); }
                                textarea::-webkit-scrollbar { width: 8px; }
                                textarea::-webkit-scrollbar-thumb { background: var(--border-secondary); border-radius: 10px; }
                            `}</style>
                            <textarea
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
    );
}