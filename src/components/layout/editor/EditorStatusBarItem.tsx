import type { ReactNode } from 'react';

export function EditorStatusBarItem({ children, className = '' }: { children: ReactNode, className?: string }) {
    return (
        <div 
            className={`px-2 flex items-center cursor-pointer text-[12px] rounded transition-colors ${className}`}
            style={{
                color: 'var(--text-tertiary)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
            {children}
        </div>
    )
}
