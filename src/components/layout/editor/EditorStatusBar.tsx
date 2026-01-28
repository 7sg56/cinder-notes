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
    const fileName = file ? file.name.split('.').slice(0, -1).join('.') : 'main';

    // Calculate lines and words
    const lines = activeFileContent ? activeFileContent.split('\n').length : 0;
    const words = activeFileContent ? activeFileContent.trim().split(/\s+/).filter(w => w.length > 0).length : 0;

    // Determine mode
    const mode = isPreview ? 'Preview' : 'Editing';

    return (
        <div 
            className="h-[26px] border-t text-[9px] font-bold uppercase tracking-[0.15em] flex items-center justify-between px-4 select-none z-10"
            style={{
                backgroundColor: 'rgba(10, 10, 12, 0.8)', // Dark translucent base
                borderColor: 'rgba(255, 255, 255, 0.05)',
                color: '#555' // Muted default text
            }}
        >
            {/* Left side: Branch/File Info */}
            <div className="flex items-center h-full">
                <EditorStatusBarItem>
                    <div className="flex items-center transition-colors hover:text-[#f48c25]">
                        <GitBranch size={12} className="mr-1.5 opacity-70" />
                        <span style={{ color: '#888' }}>{fileName}</span>
                        <span className="ml-1 text-[#f48c25] opacity-80">*</span>
                    </div>
                </EditorStatusBarItem>
            </div>

            {/* Right side: Stats & Mode */}
            <div className="flex items-center h-full gap-6">
                <div className="flex items-center gap-4 border-r pr-4" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <EditorStatusBarItem>{lines} lines</EditorStatusBarItem>
                    <EditorStatusBarItem>{words} words</EditorStatusBarItem>
                </div>

                <EditorStatusBarItem>
                    <div className="flex items-center gap-2">
                        {/* Status dot indicator */}
                        <div 
                            className="w-1.5 h-1.5 rounded-full" 
                            style={{ 
                                backgroundColor: '#f48c25',
                                boxShadow: '0 0 6px #f48c25' 
                            }} 
                        />
                        <span style={{ color: '#fff' }}>{mode}</span>
                    </div>
                </EditorStatusBarItem>
            </div>
        </div>
    );
}