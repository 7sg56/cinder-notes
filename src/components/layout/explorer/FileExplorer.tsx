import { useAppStore } from '../../../store/useAppStore';
import { FileTreeItem } from './FileTreeItem';
import { ExplorerActions } from './ExplorerActions';
import { ExplorerFooter } from './ExplorerFooter';

export function FileExplorer() {
    const { files } = useAppStore();

    return (
        <div className="h-full flex flex-col bg-[#1e1f1c]">
            {/* Quick Actions Header */}
            <ExplorerActions />

            {/* Main File List */}
            <div className="flex-1 overflow-y-auto no-scrollbar pt-2">
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

            {/* Footer */}
            <ExplorerFooter />
        </div>
    );
}
