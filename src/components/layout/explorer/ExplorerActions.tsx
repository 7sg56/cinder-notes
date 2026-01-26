import { FilePlus, FolderPlus, RefreshCw, ChevronLeft } from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';

export function ExplorerActions() {
    const { toggleExplorerCollapsed } = useAppStore();

    return (
        <div 
            className="flex items-center gap-1 p-2"
            style={{
                backgroundColor: 'var(--bg-primary)',
                borderBottom: '1px solid var(--border-secondary)',
                color: 'var(--text-primary)'
            }}
        >
            <button 
                className="p-1 rounded group transition-colors" 
                title="New File"
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
                <FilePlus size={16} className="opacity-70 group-hover:opacity-100 transition-opacity" />
            </button>
            <button 
                className="p-1 rounded group transition-colors" 
                title="New Folder"
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
                <FolderPlus size={16} className="opacity-70 group-hover:opacity-100 transition-opacity" />
            </button>
            <button 
                className="p-1 rounded group transition-colors" 
                title="Refresh Explorer"
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
                <RefreshCw size={16} className="opacity-70 group-hover:opacity-100 transition-opacity" />
            </button>
            <div className="flex-1" />
            <button 
                onClick={() => toggleExplorerCollapsed()}
                className="p-1 rounded group transition-colors" 
                title="Collapse All"
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
                <ChevronLeft size={16} className="opacity-70 group-hover:opacity-100 transition-opacity" />
            </button>
        </div>
    );
}
