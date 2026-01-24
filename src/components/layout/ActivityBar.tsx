import { Files, Search, GitBranch, Settings, CircleUser } from 'lucide-react';
import { SidebarTab } from './SidebarTab';

export function ActivityBar() {
    return (
        <div className="w-[50px] flex-shrink-0 flex flex-col bg-[#272822] border-l border-[#171717] items-center py-2 z-10">
            <div className="flex-1 flex flex-col gap-2">
                <SidebarTab icon={Files} active />
                <SidebarTab icon={Search} />
                <SidebarTab icon={GitBranch} />
            </div>
            <div className="flex flex-col gap-2 pb-2">
                <SidebarTab icon={CircleUser} />
                <SidebarTab icon={Settings} />
            </div>
        </div>
    );
}
