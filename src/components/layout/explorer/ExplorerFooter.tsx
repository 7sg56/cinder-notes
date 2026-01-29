import { Settings, Archive } from 'lucide-react';
import { ThemeSwitcher } from '../../ThemeSwitcher';


export function ExplorerFooter() {
    return (
        <div 
            className="flex items-center justify-between border-t px-2 py-1.5"
            style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-secondary)'
            }}
        >
            {/* Cinder Vault */}
            <div 
                className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded group transition-colors"
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
                <Archive size={14} className="opacity-80 group-hover:opacity-100" style={{ color: '#a6e22e' }} />
                <span className="text-[12px] font-medium opacity-80 group-hover:opacity-100" style={{ color: 'white' }}>Cinder Vault</span>
            </div>

            {/* Settings, Theme & Help */}
            <div className="flex items-center gap-0.5">
                <div 
                    className="p-1.5 cursor-pointer rounded group transition-colors" 
                    style={{ color: 'var(--text-primary)' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    title="Settings"
                >
                    <Settings size={14} className="opacity-60 group-hover:opacity-100" />
                </div>
                <ThemeSwitcher />
            </div>
        </div>
    );
}
