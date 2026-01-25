
import { X } from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';

export function EditorTabs() {
    const { openFiles, activeFileId, selectFile, closeFile, findFile } = useAppStore();

    if (openFiles.length === 0) return null;

    return (
        <div className="flex bg-[#1e1f1c] border-b border-[#171717]/50 overflow-x-auto no-scrollbar shrink-0">
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
