import type { LucideIcon } from 'lucide-react';

interface ActivityBarItemProps {
    icon: LucideIcon;
    active?: boolean;
}

export function ActivityBarItem({ icon: Icon, active = false }: ActivityBarItemProps) {
    return (
        <div 
            className={`p-3 cursor-pointer transition-colors ${active ? 'border-l-2' : ''}`}
            style={{
                color: active ? 'var(--activity-item-text-active)' : 'var(--activity-item-text-default)',
                backgroundColor: active ? 'var(--activity-item-bg-active)' : 'transparent',
                borderLeft: active ? `2px solid var(--activity-item-border-active)` : 'none',
            }}
            onMouseEnter={(e) => {
                if (!active) {
                    e.currentTarget.style.color = 'var(--activity-item-text-hover)';
                }
            }}
            onMouseLeave={(e) => {
                if (!active) {
                    e.currentTarget.style.color = 'var(--activity-item-text-default)';
                }
            }}
        >
            <Icon size={24} strokeWidth={1.5} />
        </div>
    );
}
