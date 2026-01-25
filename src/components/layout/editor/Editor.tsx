import { useState } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Eye, Edit2 } from 'lucide-react';

export function Editor() {
    const { activeFileId, activeFileContent, updateFileContent } = useAppStore();
    const [isPreview, setIsPreview] = useState(false);

    // If no active file, just show empty state in main area
    // Tabs are now handled by EditorPane

    return (
        <div className="h-full flex flex-col bg-[#272822] relative group">


            {!activeFileId ? (
                <div className="flex-1 flex items-center justify-center bg-[#272822] text-[#75715e]">
                    <div className="text-center">
                        <p className="mb-2 text-lg font-medium opacity-50">No file selected</p>
                    </div>
                </div>
            ) : (
                <div className="flex-1 relative flex flex-col min-h-0">
                    {/* Toolbar/Toggle */}
                    <button
                        onClick={() => setIsPreview(!isPreview)}
                        className="absolute top-4 right-4 z-10 p-2 rounded bg-black/20 hover:bg-black/40 text-[#f8f8f2] transition-opacity opacity-0 group-hover:opacity-100"
                        title={isPreview ? "Edit" : "Preview"}
                    >
                        {isPreview ? <Edit2 size={16} /> : <Eye size={16} />}
                    </button>

                    {isPreview ? (
                        <div className="flex-1 w-full h-full p-8 overflow-y-auto prose prose-invert prose-stone max-w-none text-[#f8f8f2]">
                            <style>{`
                        .prose h1, .prose h2, .prose h3, .prose h4 { color: #f92672; }
                        .prose a { color: #66d9ef; }
                        .prose code { color: #ae81ff; background: #23241f; padding: 2px 4px; border-radius: 4px; }
                        .prose pre { background: #23241f; }
                        .prose strong { color: #f92672; }
                        .prose ul > li::marker { color: #66d9ef; }
                    `}</style>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {activeFileContent}
                            </ReactMarkdown>
                        </div>
                    ) : (
                        <textarea
                            className="flex-1 w-full h-full bg-[#272822] text-[#f8f8f2] p-8 outline-none resize-none font-mono text-[14px] leading-relaxed selection:bg-[#49483e]"
                            value={activeFileContent}
                            onChange={(e) => updateFileContent(activeFileId, e.target.value)}
                            spellCheck={false}
                            placeholder="Start writing..."
                        />
                    )}
                </div>
            )}
        </div>
    );
}
