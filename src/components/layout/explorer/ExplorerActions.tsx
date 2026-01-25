import { FilePlus, FolderPlus, RefreshCw, MinusSquare } from 'lucide-react';

export function ExplorerActions() {
    return (
        <div className="flex items-center gap-1 p-2 bg-[#1e1f1c] border-b border-[#2d2e28] text-[#cfcfc2]">
            <button className="p-1 hover:bg-[#3e3d32] rounded group" title="New File">
                <FilePlus size={16} className="opacity-70 group-hover:opacity-100 transition-opacity" />
            </button>
            <button className="p-1 hover:bg-[#3e3d32] rounded group" title="New Folder">
                <FolderPlus size={16} className="opacity-70 group-hover:opacity-100 transition-opacity" />
            </button>
            <button className="p-1 hover:bg-[#3e3d32] rounded group" title="Refresh Explorer">
                <RefreshCw size={16} className="opacity-70 group-hover:opacity-100 transition-opacity" />
            </button>
            <div className="flex-1" />
            <button className="p-1 hover:bg-[#3e3d32] rounded group" title="Collapse All">
                <MinusSquare size={16} className="opacity-70 group-hover:opacity-100 transition-opacity" />
            </button>
        </div>
    );
}
