import { Files, Search, GitBranch, CircleUser, Lock } from 'lucide-react';
import { ActivityBarItem } from './ActivityBarItem';

export function ActivityBar() {
    return (
        <div 
            className="w-[50px] flex-shrink-0 flex flex-col items-center py-2 z-10"
            style={{
                backgroundColor: 'var(--activity-bar-bg)',
                borderLeft: `1px solid var(--activity-bar-border)`
            }}
        >
            <div className="flex-1 flex flex-col gap-2">
                <ActivityBarItem icon={Files} active />
                <ActivityBarItem icon={Search} />
                <ActivityBarItem icon={GitBranch} />
                <ActivityBarItem icon={Lock} />
            </div>
            <div className="flex flex-col gap-2 pb-2">
                <ActivityBarItem icon={CircleUser} />
            </div>
        </div>
    );
}
