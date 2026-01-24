import { useAppStore } from '../../../store/useAppStore';
import { FileTreeItem } from './FileTreeItem';

export function FileExplorer() {
    const { files } = useAppStore();

    return (
        <div className="h-full bg-[#1e1f1c] pt-0 overflow-y-auto whitespace-nowrap">
            <div className="h-[35px] flex items-center px-4 uppercase tracking-widest text-[11px] font-bold text-[#8f908a] opacity-80 group">
                <span className="flex-1">Folders</span>
                <span className="opacity-0 group-hover:opacity-100 cursor-pointer hover:text-[#f8f8f2] text-[16px]">...</span>
            </div>
            <div>
                {files.map((node) => (
                    <FileTreeItem key={node.id} node={node} />
                ))}
            </div>
        </div>
    );
}
