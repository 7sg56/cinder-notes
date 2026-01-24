import { useState } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Eye, Edit2, X } from 'lucide-react';

function EditorTabs() {
    const { openFiles, activeFileId, selectFile, closeFile, findFile } = useAppStore();

    if (openFiles.length === 0) return null;

    return (
        <div className="flex bg-[#1e1f1c] border-b border-[#171717]/50 overflow-x-auto no-scrollbar">
            {openFiles.map(fileId => {
                const file = findFile(fileId);
                const isActive = activeFileId === fileId;
                if (!file) return null;

                return (
                    <div
                        key={fileId}
                        onClick={() => selectFile(fileId)}
                        className={`
                            group flex items-center min-w-[120px] max-w-[200px] h-[35px] px-3 border-r border-[#171717]/50 cursor-pointer text-[13px] select-none
                            ${isActive ? 'bg-[#272822] text-[#f8f8f2]' : 'bg-[#1e1f1c] text-[#75715e] hover:bg-[#272822]/50'}
                        `}
                    >
                        <span className="truncate flex-1 mr-2">{file.name}</span>
                        <span
                            onClick={(e) => { e.stopPropagation(); closeFile(fileId); }}
                            className={`opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-[#3e3d32] ${isActive ? 'text-[#f8f8f2]' : ''}`}
                        >
                            <X size={12} />
                        </span>
                    </div>
                )
            })}
        </div>
    )
}

export function Editor() {
    const { activeFileId, activeFileContent, updateFileContent } = useAppStore();
    const [isPreview, setIsPreview] = useState(false);

    // If no active file, just show tabs (if any) or empty state in main area
    // But we should always render the tabs container if we want VS Code style persistence

    return (
        <div className="h-full flex flex-col bg-[#272822] relative group">
            <EditorTabs />

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
