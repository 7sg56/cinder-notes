import { FilePlus, FolderOpen, Settings, Sparkles, Command, Blocks } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export function WelcomePage() {
    const { createNewTab } = useAppStore();

    const sections = [
        {
            title: "Get Started",
            items: [
                { icon: FilePlus, label: "New File", shortcut: "Ctrl+N", action: createNewTab },
                { icon: FolderOpen, label: "Open Project", shortcut: "Ctrl+O", action: () => { } },
                { icon: Command, label: "Open Command Palette", shortcut: "Ctrl+Shift+P", action: () => { } },
            ]
        },
        {
            title: "Configure",
            items: [
                { icon: Settings, label: "Open Settings", shortcut: "Ctrl+,", action: () => { } },
                { icon: Blocks, label: "Explore Extensions", shortcut: "Ctrl+Shift+X", action: () => { } },
            ]
        }
    ];

    return (
        <div className="h-full w-full flex flex-col items-center justify-center bg-[#0c0c0c] select-none relative">

            {/* Main Centered Content Wrapper */}
            <div className="flex flex-col items-center w-full max-w-[400px]">

                {/* Logo & Header */}
                <div className="mb-16 flex flex-col items-center text-center">
                    <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 mb-6 shadow-xl shadow-orange-500/5">
                        <Sparkles size={48} className="text-orange-500" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight mb-2 text-white">
                        Welcome to Cinder
                    </h1>
                    <p className="text-sm text-gray-500 italic">
                        The editor for what's next.
                    </p>
                </div>

                {/* Actions List */}
                <div className="w-full space-y-12">
                    {sections.map((section, idx) => (
                        <div key={idx} className="space-y-4">
                            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] px-3 text-gray-600">
                                {section.title}
                            </h2>
                            <div className="space-y-1">
                                {section.items.map((item, itemIdx) => (
                                    <button
                                        key={itemIdx}
                                        onClick={item.action}
                                        className="w-full flex items-center justify-between px-3 py-2 rounded-md group hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
                                    >
                                        <div className="flex items-center gap-4">
                                            <item.icon size={18} className="opacity-60 group-hover:opacity-100" />
                                            <span className="text-[13px] font-medium">{item.label}</span>
                                        </div>
                                        {item.shortcut && (
                                            <div className="flex gap-1 items-center">
                                                {item.shortcut.split('+').map(key => (
                                                    <kbd key={key} className="min-w-[20px] h-[18px] flex items-center justify-center text-[9px] rounded bg-[#1a1a1a] border border-white/5 text-gray-500 px-1">
                                                        {key === 'Ctrl' ? '⌃' : key}
                                                    </kbd>
                                                ))}
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer - Positioned Absolutely at the bottom */}
            <div className="absolute bottom-10 left-0 right-0 flex justify-center">
                <button className="text-[11px] text-gray-700 hover:text-gray-400 transition-colors">
                    Return to Onboarding
                </button>
            </div>
        </div>
    );
}