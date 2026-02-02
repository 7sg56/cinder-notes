import { EditorStatusBarItem } from './EditorStatusBarItem';
import { useAppStore } from '../../../store/useAppStore';

interface EditorStatusBarProps {
    isPreview: boolean;
}

export function EditorStatusBar({ isPreview }: EditorStatusBarProps) {
    const { activeFileContent, isAutoSave } = useAppStore();

    // Calculate lines and words
    const lines = activeFileContent ? activeFileContent.split('\n').length : 0;
    const words = activeFileContent ? activeFileContent.trim().split(/\s+/).filter(w => w.length > 0).length : 0;

    // Determine mode
    const mode = isPreview ? 'Preview' : 'Editing';

    // Save mode text
    const saveMode = isAutoSave ? 'Auto Save' : 'Manual';

    return (
        <div
            className="h-[28px] border-t text-[9px] font-medium uppercase tracking-[0.15em] flex items-center justify-between px-4 select-none z-10 transition-colors duration-200"
            style={{
                backgroundColor: 'var(--editor-bg)',
                borderColor: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text-tertiary)'
            }}
        >
            {/* Left side: Save Indicator & Mode */}
            <div className="flex items-center h-full gap-3">
                {/* Save Indicator (Green Orb) */}
                <div className="flex items-center justify-center w-3 h-full" title={saveMode}>
                    <div
                        className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                        style={{
                            backgroundColor: isAutoSave ? '#22c55e' : '#f59e0b', // Green for auto, amber for manual
                            boxShadow: isAutoSave ? '0 0 4px rgba(34, 197, 94, 0.3)' : '0 0 4px rgba(245, 158, 11, 0.3)'
                        }}
                    />
                </div>

                <EditorStatusBarItem>
                    <span style={{ color: 'var(--text-secondary)' }} className="opacity-75 hover:opacity-100 transition-opacity">
                        {saveMode}
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