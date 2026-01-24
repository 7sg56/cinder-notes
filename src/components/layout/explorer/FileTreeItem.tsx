import { useState } from 'react';
import type { FileNode } from '../../../data/mockFileSystem';
import { useAppStore } from '../../../store/useAppStore';
import { ChevronRight, FileText, Folder, FolderOpen } from 'lucide-react';

interface FileTreeItemProps {
    node: FileNode;
    depth?: number;
}

export function FileTreeItem({ node, depth = 0 }: FileTreeItemProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { selectFile, activeFileId } = useAppStore();

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (node.type === 'folder') {
            setIsOpen(!isOpen);
        } else {
            selectFile(node.id);
        }
    };

    const isActive = activeFileId === node.id;
    const paddingLeft = `${depth * 12 + 12}px`;

    return (
        <div>
            <div
                onClick={handleClick}
                style={{ paddingLeft }}
                className={`
          group flex items-center py-1 cursor-pointer text-[13px] select-none
          ${isActive ? 'bg-[#3e3d32] text-white' : 'text-[#cfcfc2] hover:bg-[#2b2b2b]'}
        `}
            >
                <span className="mr-1.5 opacity-80 group-hover:opacity-100 flex-shrink-0">
                    {node.type === 'folder' ? (
                        <ChevronRight
                            size={14}
                            className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''} text-[#8f908a]`}
                        />
                    ) : (
                        <span className="w-3.5 inline-block" />
                    )}
                </span>

                <span className="mr-1.5 opacity-70">
                    {node.type === 'folder' ? (
                        isOpen ? <FolderOpen size={14} className="text-[#8f908a]" /> : <Folder size={14} className="text-[#8f908a]" />
                    ) : (
                        <FileText size={14} className="text-[#8f908a]" />
                    )}
                </span>

                <span className="truncate font-normal tracking-wide">{node.name}</span>
            </div>

            {node.type === 'folder' && isOpen && node.children && (
                <div className="">
                    {node.children.map((child) => (
                        <FileTreeItem key={child.id} node={child} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}
