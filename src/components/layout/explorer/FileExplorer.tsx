import { useState, useMemo } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import type { FileNode } from '../../../data/mockFileSystem';
import { FileTreeItem } from './FileTreeItem';
import { ExplorerFooter } from './ExplorerFooter';

import { VscSearch, VscTypeHierarchy } from 'react-icons/vsc';
import { SquarePen } from 'lucide-react';

// Helper to filter nodes recursively
const filterNodes = (nodes: FileNode[], query: string): FileNode[] => {
    if (!query) return nodes;

    return nodes.reduce((acc, node) => {
        if (node.type === 'file') {
            if (node.name.toLowerCase().includes(query.toLowerCase())) {
                acc.push(node);
            }
        } else if (node.type === 'folder') {
            const filteredChildren = node.children ? filterNodes(node.children, query) : [];

            // If folder matches OR has matching children, keep it
            const matchesName = node.name.toLowerCase().includes(query.toLowerCase());

            if (matchesName || filteredChildren.length > 0) {
                acc.push({ ...node, children: filteredChildren });
            }
        }
        return acc;
    }, [] as FileNode[]);
};

export function FileExplorer() {
    const { files, createFile, moveNode } = useAppStore();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredFiles = useMemo(() => {
        if (!searchQuery.trim()) return files;
        return filterNodes(files, searchQuery.trim());
    }, [files, searchQuery]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const sourceId = e.dataTransfer.getData('sourceId');
        if (sourceId) {
            moveNode(sourceId, 'root', 'root');
        }
    };

    return (
        <div
            className="h-full flex flex-col"
            style={{ backgroundColor: 'var(--bg-primary)' }}
        >
            {/* Header: Explorer Title (Matches Tab Height) */}
            <div
                className="h-[40px] shrink-0 flex items-center justify-between px-4 border-b select-none"
                style={{
                    color: 'var(--text-secondary)',
                    borderColor: 'var(--border-primary)'
                }}
            >
                <span className="text-[11px] font-bold tracking-wider opacity-60 uppercase pl-1">Explorer</span>
                <VscTypeHierarchy size={15} className="opacity-60" />
            </div>

            {/* Search Bar Row */}
            <div className="shrink-0 px-4 py-3 flex items-center gap-2">
                <div
                    className="flex-1 flex items-center h-[28px] rounded-md px-2 gap-1.5 transition-colors focus-within:bg-[var(--bg-secondary)]"
                    style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '1px solid transparent'
                    }}
                >
                    <VscSearch size={14} style={{ color: 'var(--text-tertiary)' }} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search..."
                        className="flex-1 bg-transparent border-none outline-none text-[12px] placeholder:text-[var(--text-tertiary)] min-w-0"
                        style={{ color: 'var(--text-primary)' }}
                    />
                </div>

                <button
                    onClick={() => createFile()}
                    className="h-[28px] w-[28px] flex items-center justify-center rounded-md transition-colors hover:bg-[var(--bg-hover)]"
                    style={{ color: 'var(--text-secondary)' }}
                    title="New Note"
                >
                    <SquarePen size={15} strokeWidth={2.5} />
                </button>
            </div>

            {/* Main File List */}
            <div
                className="flex-1 overflow-y-auto no-scrollbar pt-0 px-2 pb-2"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                {filteredFiles.length === 0 ? (
                    <div className="px-4 py-4 text-center text-[12px] opacity-50 select-none">
                        No matches found
                    </div>
                ) : (
                    <div>
                        {filteredFiles.map((node) => (
                            <FileTreeItem key={node.id} node={node} />
                        ))}
                    </div>
                )}
            </div>

            <ExplorerFooter />
        </div>
    );
}
