import { Settings, HelpCircle, Archive } from 'lucide-react';

export function ExplorerFooter() {
    return (
        <div className="flex items-center justify-between bg-[#1e1f1c] border-t border-[#2d2e28] px-2 py-1.5">
            {/* Cinder Vault */}
            <div className="flex items-center gap-2 cursor-pointer hover:bg-[#2d2e28] px-2 py-1 rounded group transition-colors">
                <Archive size={14} className="text-[#a6e22e] opacity-80 group-hover:opacity-100" />
                <span className="text-[12px] text-[#cfcfc2] font-medium opacity-80 group-hover:opacity-100">Cinder Vault</span>
            </div>

            {/* Settings & Help */}
            <div className="flex items-center gap-0.5">
                <div className="p-1.5 cursor-pointer hover:bg-[#3e3d32] rounded group transition-colors" title="Settings">
                    <Settings size={14} className="text-[#cfcfc2] opacity-60 group-hover:opacity-100" />
                </div>
                <div className="p-1.5 cursor-pointer hover:bg-[#3e3d32] rounded group transition-colors" title="Help">
                    <HelpCircle size={14} className="text-[#cfcfc2] opacity-60 group-hover:opacity-100" />
                </div>
            </div>
        </div>
    );
}
