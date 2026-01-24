import type { ReactNode } from 'react';

export function FooterItem({ children, className = '' }: { children: ReactNode, className?: string }) {
    return (
        <div className={`px-2 flex items-center hover:bg-[#3e3d32] cursor-pointer text-[12px] ${className}`}>
            {children}
        </div>
    )
}
