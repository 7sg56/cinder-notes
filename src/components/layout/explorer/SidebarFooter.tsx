import { Trash2, Settings } from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';

export function SidebarFooter() {
  const { openSystemTab } = useAppStore();
  const workspacePath = useAppStore((s) => s.workspacePath);

  const workspaceName = workspacePath
    ? workspacePath.split('/').pop() ||
      workspacePath.split('\\').pop() ||
      'Workspace'
    : 'Explorer';

  return (
    <>
      <div
        className="h-px w-full shrink-0"
        style={{ backgroundColor: 'var(--separator)' }}
      />
      <div className="h-[40px] shrink-0 flex items-center justify-between px-3 select-none">
        {/* Left: Settings */}
        <button
          onClick={() => openSystemTab('cinder-settings')}
          className="h-[28px] w-[28px] flex items-center justify-center rounded-md transition-colors hover:bg-[var(--bg-hover)]"
          style={{ color: 'var(--text-secondary)' }}
          title="Settings"
        >
          <Settings size={15} strokeWidth={2} />
        </button>

        {/* Center: Workspace name */}
        <span
          className="text-[11px] font-bold tracking-wider opacity-60 uppercase px-2 truncate"
          style={{ color: 'var(--text-secondary)' }}
        >
          {workspaceName}
        </span>

        {/* Right: Trash */}
        <button
          onClick={() => openSystemTab('cinder-trash')}
          className="h-[28px] w-[28px] flex items-center justify-center rounded-md transition-colors hover:bg-[var(--bg-hover)]"
          style={{ color: 'var(--text-secondary)' }}
          title="Trash"
        >
          <Trash2 size={15} strokeWidth={2} />
        </button>
      </div>
    </>
  );
}
