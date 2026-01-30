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
            className="h-[28px] border-t text-[9px] font-medium uppercase tracking-[0.15em] flex items-center justify-between px-4 select-none z-10 transition-colors duration-200"
            style={{
                backgroundColor: 'var(--editor-bg)',
                borderColor: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text-tertiary)'
            }}
        >
            {/* Left side: Save Indicator & File Info */}
            <div className="flex items-center h-full gap-3">
                {/* Save Indicator (Green Orb) */}
                <div className="flex items-center justify-center w-3 h-full" title="Auto-saved">
                    <div
                        className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                        style={{
                            backgroundColor: '#22c55e', // Green for auto-save
                            boxShadow: '0 0 4px rgba(34, 197, 94, 0.3)'
                        }}
                    />
                </div>

                <EditorStatusBarItem>
                    <span style={{ color: 'var(--text-secondary)' }} className="opacity-75 hover:opacity-100 transition-opacity">
                        {fileName}
                    </span>
                </EditorStatusBarItem>
            </div>

            {/* Right side: Stats & Mode */}
            <div className="flex items-center h-full gap-5">
                <div
                    className="flex items-center gap-4"
                >
                    <EditorStatusBarItem>
                        <span style={{ color: 'var(--text-secondary)' }} className="font-normal opacity-50">{lines} lines</span>
                    </EditorStatusBarItem>
                    <EditorStatusBarItem>
                        <span style={{ color: 'var(--text-secondary)' }} className="font-normal opacity-50">{words} words</span>
                    </EditorStatusBarItem>
                </div>

                <EditorStatusBarItem>
                    <span style={{ color: 'var(--text-secondary)' }} className="opacity-75">{mode}</span>
                </EditorStatusBarItem>
            </div>
        </div>
    );
}