import { useAppStore } from '../../../store/useAppStore';
import { FileTreeItem } from './FileTreeItem';
import { ExplorerActions } from './ExplorerActions';
import { ExplorerFooter } from './ExplorerFooter';

export function FileExplorer() {
    const { files } = useAppStore();

    return (
        <div 
            className="h-full flex flex-col"
            style={{ backgroundColor: 'var(--bg-primary)' }}
        >
            {/* Quick Actions Header */}
            <ExplorerActions />

            {/* Main File List */}
            <div className="flex-1 overflow-y-auto no-scrollbar pt-2">
                <div 
                    className="h-[35px] flex items-center px-4 uppercase tracking-widest text-[11px] font-bold opacity-80 group"
                    style={{ color: 'var(--text-secondary)' }}
                >
                    <span className="flex-1">Folders</span>
                    <span 
                        className="opacity-0 group-hover:opacity-100 cursor-pointer text-[16px] transition-colors"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        ...
                    </span>
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
