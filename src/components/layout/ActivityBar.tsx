import { Files, Search, GitBranch, Settings, CircleUser } from 'lucide-react';
import { ActivityBarItem } from './ActivityBarItem';

export function ActivityBar() {
    return (
        <div className="w-[50px] flex-shrink-0 flex flex-col bg-[#272822] border-l border-[#171717] items-center py-2 z-10">
            <div className="flex-1 flex flex-col gap-2">
                <ActivityBarItem icon={Files} active />
                <ActivityBarItem icon={Search} />
                <ActivityBarItem icon={GitBranch} />
            </div>
            <div className="flex flex-col gap-2 pb-2">
                <ActivityBarItem icon={CircleUser} />
                <ActivityBarItem icon={Settings} />
            </div>
        </div>
    );
}
