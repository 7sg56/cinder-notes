import { GitBranch, Bell } from 'lucide-react';
import { FooterItem } from './FooterItem';

export function StatusBar() {
    return (
        <div className="h-[22px] bg-[#007ace] text-white flex items-center justify-between px-2 select-none z-10 text-[12px] font-medium tracking-wide">
            <div className="flex items-center h-full">
                <FooterItem>
                    <GitBranch size={12} className="mr-1" />
                    main*
                </FooterItem>
                <FooterItem>0 errors</FooterItem>
                <FooterItem>0 warnings</FooterItem>
            </div>
            <div className="flex items-center h-full gap-4">
                <FooterItem>Ln 12, Col 42</FooterItem>
                <FooterItem>UTF-8</FooterItem>
                <FooterItem>Markdown</FooterItem>
                <FooterItem>
                    <Bell size={12} />
                </FooterItem>
            </div>
        </div>
    );
}
