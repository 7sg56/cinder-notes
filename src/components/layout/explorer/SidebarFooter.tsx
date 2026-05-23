import { Trash2, Settings, Info } from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';

export function SidebarFooter() {
  const { openSystemTab } = useAppStore();

  const buttons = [
    { icon: Trash2, tab: 'cinder-trash', title: 'Trash' },
    { icon: Settings, tab: 'cinder-settings', title: 'Settings' },
    { icon: Info, tab: 'cinder-info', title: 'About Cinder' },
  ];

  return (
    <div
      className="h-[40px] shrink-0 flex items-center px-3 gap-1 border-t select-none"
      style={{
        borderColor: 'var(--border-primary)',
        backgroundColor: 'var(--bg-primary)',
      }}
    >
      {buttons.map(({ icon: Icon, tab, title }) => (
        <button
          key={tab}
          onClick={() => openSystemTab(tab)}
          className="h-[28px] w-[28px] flex items-center justify-center rounded-md transition-colors hover:bg-[var(--bg-hover)]"
          style={{ color: 'var(--text-secondary)' }}
          title={title}
        >
          <Icon size={15} strokeWidth={2} />
        </button>
      ))}
    </div>
  );
}
