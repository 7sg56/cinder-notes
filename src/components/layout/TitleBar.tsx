import type { CSSProperties } from 'react';
import { ThemeSwitcher } from '../ThemeSwitcher';

export function TitleBar() {
    return (
        <div
            className="h-[35px] flex items-center justify-between px-3 border-b select-none drag-region"
            style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-primary)'
            }}
        >
            <div className="w-8" />

            <span
                className="text-[13px] font-medium opacity-80"
                style={{ color: 'var(--text-primary)' }}
            >
                Cinder Notes
            </span>

            <div className="flex items-center justify-end w-8" style={{ WebkitAppRegion: 'no-drag' } as CSSProperties & { WebkitAppRegion?: string }}>
                <ThemeSwitcher />
            </div>
        </div>
    );
}
