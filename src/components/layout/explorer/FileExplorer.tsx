import { useAppStore } from '../../../store/useAppStore';
import { FileTreeItem } from './FileTreeItem';
import { ExplorerFooter } from './ExplorerFooter';

import { FilePlus, FolderPlus, RefreshCw } from 'lucide-react';

export function FileExplorer() {
    const { files } = useAppStore();

    return (
        <div
            className="h-full flex flex-col"
            style={{ backgroundColor: 'var(--bg-primary)' }}
        >
            {/* Quick Actions Header */}

            {/* Main File List */}
            <div className="flex-1 overflow-y-auto no-scrollbar pt-2">
                <div
                    className="h-[35px] flex items-center px-4 group gap-2 justify-between"
                    style={{
                        color: 'var(--text-secondary)',
                        borderBottom: '1px solid var(--border-secondary)',
                        marginBottom: '4px'
                    }}
                >
                    <span className="text-[11px] font-bold tracking-wider opacity-80 uppercase">Explorer</span>
                    <div className="flex items-center gap-0.5">
                        <button
                            className="p-1 rounded group/btn transition-colors"
                            title="New File"
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <FilePlus size={14} className="opacity-70 group-hover/btn:opacity-100 transition-opacity" />
                        </button>
                        <button
                            className="p-1 rounded group/btn transition-colors"
                            title="New Folder"
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <FolderPlus size={14} className="opacity-70 group-hover/btn:opacity-100 transition-opacity" />
                        </button>
                        <button
                            className="p-1 rounded group/btn transition-colors"
                            title="Refresh Explorer"
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <RefreshCw size={14} className="opacity-70 group-hover/btn:opacity-100 transition-opacity" />
                        </button>
                    </div>
                </div>
                <div>
                    {files.map((node) => (
                        <FileTreeItem key={node.id} node={node} />
                    ))}
                </div>
            </div>
            <ExplorerFooter />
        </div>
    );
}
