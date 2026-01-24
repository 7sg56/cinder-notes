import type { LucideIcon } from 'lucide-react';

interface SidebarTabProps {
    icon: LucideIcon;
    active?: boolean;
}

export function SidebarTab({ icon: Icon, active = false }: SidebarTabProps) {
    return (
        <div className={`p-3 cursor-pointer hover:text-white transition-colors ${active ? 'text-white border-l-2 border-[#f92672]' : 'text-[#8f908a]'}`}>
            <Icon size={24} strokeWidth={1.5} />
        </div>
    );
}
