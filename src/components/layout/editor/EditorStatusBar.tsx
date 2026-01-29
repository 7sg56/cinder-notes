import { GitBranch } from 'lucide-react';
import { EditorStatusBarItem } from './EditorStatusBarItem';
import { useAppStore } from '../../../store/useAppStore';

interface EditorStatusBarProps {
    isPreview: boolean;
}

export function EditorStatusBar({ isPreview }: EditorStatusBarProps) {
    const { activeFileId, findFile, activeFileContent } = useAppStore();
    
    // Get current file name without extension
    const file = activeFileId && !activeFileId.startsWith('new-tab-') ? findFile(activeFileId) : null;
    const fileName = file ? file.name.split('.').slice(0, -1).join('.') : 'Welcome';

    // Calculate lines and words
    const lines = activeFileContent ? activeFileContent.split('\n').length : 0;
    const words = activeFileContent ? activeFileContent.trim().split(/\s+/).filter(w => w.length > 0).length : 0;

    // Determine mode
    const mode = isPreview ? 'Preview' : 'Editing';

    return (
        <div 
            className="h-[26px] border-t text-[9px] font-bold uppercase tracking-[0.15em] flex items-center justify-between px-4 select-none z-10 transition-colors duration-200"
            style={{
                backgroundColor: 'var(--bg-secondary)', // Matches activity bar/sidebar secondary regions
                borderColor: 'var(--border-primary)',
                color: 'var(--text-tertiary)'
            }}
        >
            {/* Left side: Branch/File Info */}
            <div className="flex items-center h-full">
                <EditorStatusBarItem>
                    <div className="flex items-center group cursor-default">
                        <GitBranch 
                            size={12} 
                            className="mr-1.5 opacity-70 transition-colors group-hover:text-[var(--editor-header-accent)]" 
                        />
                        <span style={{ color: 'var(--text-secondary)' }}>{fileName}</span>
                        <span className="ml-1" style={{ color: 'var(--editor-header-accent)' }}>*</span>
                    </div>
                </EditorStatusBarItem>
            </div>

            {/* Right side: Stats & Mode */}
            <div className="flex items-center h-full gap-6">
                <div 
                    className="flex items-center gap-4 border-r pr-4" 
                    style={{ borderColor: 'var(--border-secondary)' }}
                >
                    <EditorStatusBarItem>
                        <span style={{ color: 'var(--text-tertiary)' }}>{lines} lines</span>
                    </EditorStatusBarItem>
                    <EditorStatusBarItem>
                        <span style={{ color: 'var(--text-tertiary)' }}>{words} words</span>
                    </EditorStatusBarItem>
                </div>

                <EditorStatusBarItem>
                    <div className="flex items-center gap-2">
                        {/* Status dot indicator using the theme accent */}
                        <div 
                            className="w-1.5 h-1.5 rounded-full" 
                            style={{ 
                                backgroundColor: 'var(--editor-header-accent)',
                                boxShadow: '0 0 6px var(--editor-header-accent)' 
                            }} 
                        />
                        <span style={{ color: 'var(--text-primary)' }}>{mode}</span>
                    </div>
                </EditorStatusBarItem>
            </div>
        </div>
    );
}