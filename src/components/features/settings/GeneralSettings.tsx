import { Monitor, Bell, FolderOpen, Globe } from 'lucide-react';

export function GeneralSettings() {
    return (
        <div className="flex-1 overflow-y-auto w-full h-full p-8 no-scrollbar bg-[var(--bg-primary)]">
            <div className="max-w-4xl mx-auto space-y-10">
                {/* Header */}
                <div className="flex items-center justify-between pb-6 border-b border-[var(--border-primary)]">
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--text-primary)]">General Settings</h1>
                        <p className="mt-1 text-sm text-[var(--text-secondary)]">Customize your editor experience</p>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-6">
                    <h2 className="text-lg font-semibold text-[var(--text-primary)]">Appearance</h2>
                    <div className="space-y-3">
                        {[
                            { icon: Monitor, title: "Default View", desc: "Choose default view for new files", action: "Split View", options: ["Split View", "Editor Only", "Preview Only"] },
                            { icon: FolderOpen, title: "Sidebar Position", desc: "Change the location of the sidebar", action: "Left", options: ["Left", "Right"] },
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)]">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-[var(--bg-tertiary)] rounded-md text-[var(--text-secondary)]">
                                        <item.icon size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-[var(--text-primary)]">{item.title}</h3>
                                        <p className="text-xs text-[var(--text-secondary)]">{item.desc}</p>
                                    </div>
                                </div>
                                <select className="px-3 py-1.5 text-xs font-medium border border-[var(--border-secondary)] rounded hover:bg-[var(--bg-hover)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-[var(--editor-header-accent)] transition-all">
                                    {item.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                        ))}
                    </div>

                    <h2 className="text-lg font-semibold text-[var(--text-primary)] mt-8">System</h2>
                    <div className="space-y-3">
                        {[
                            { icon: Globe, title: "Language", desc: "Change interface language", action: "English", options: ["English", "Spanish", "French", "German", "Japanese"] },
                            { icon: Bell, title: "Notifications", desc: "Configure desktop notifications", action: "All", options: ["All", "Important Only", "None"] },
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)]">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-[var(--bg-tertiary)] rounded-md text-[var(--text-secondary)]">
                                        <item.icon size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-[var(--text-primary)]">{item.title}</h3>
                                        <p className="text-xs text-[var(--text-secondary)]">{item.desc}</p>
                                    </div>
                                </div>
                                <select className="px-3 py-1.5 text-xs font-medium border border-[var(--border-secondary)] rounded hover:bg-[var(--bg-hover)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] outline-none focus:ring-1 focus:ring-[var(--editor-header-accent)] transition-all">
                                    {item.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
