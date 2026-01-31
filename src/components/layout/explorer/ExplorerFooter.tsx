import { Settings } from 'lucide-react';
import { ThemeSwitcher } from '../../features/ThemeSwitcher';
import appIcon from '../../../assets/app-icon.png';

export function ExplorerFooter() {
    return (
        <div
            className="flex items-center justify-between border-t h-14 select-none"
            style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-primary)'
            }}
        >
            {/* Left: Icon | Vault Name */}
            <div className="flex items-center h-full">
                {/* App Icon */}
                <div className="flex items-center justify-center px-3 h-full">
                    <img src={appIcon} alt="App Icon" className="h-[40px] w-auto object-contain" />
                </div>

                {/* Vertical Separator */}
                <div className="h-full w-px bg-white/10" style={{ backgroundColor: 'var(--border-primary)' }} />

                {/* Vault Name */}
                <div className="flex items-center px-3 h-full">
                    <span className="text-[13px] font-medium truncate max-w-[120px]" style={{ color: 'var(--text-primary)' }}>
                        .cinder
                    </span>
                </div>
            </div>

            {/* Right: Border | Settings & Theme */}
            <div className="flex items-center h-full">
                {/* Vertical Separator */}
                <div className="h-full w-px bg-white/10 mx-2" style={{ backgroundColor: 'var(--border-primary)' }} />

                <div className="flex items-center gap-1 pr-2">
                    <div
                        className="p-1.5 cursor-pointer rounded-md hover:bg-[var(--bg-hover)] transition-colors"
                        title="Settings"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        <Settings size={15} />
                    </div>
                    <ThemeSwitcher />
                </div>
            </div>
        </div>
    );
}
