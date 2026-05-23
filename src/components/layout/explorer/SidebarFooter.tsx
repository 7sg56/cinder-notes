import { useState, useEffect } from 'react';
import { Trash2, Settings } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { useAppStore } from '../../../store/useAppStore';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function SidebarFooter() {
  const { openSystemTab } = useAppStore();
  const workspacePath = useAppStore((s) => s.workspacePath);
  const files = useAppStore((s) => s.files);
  const [stats, setStats] = useState<{ count: number; size: number } | null>(
    null
  );

  useEffect(() => {
    if (!workspacePath) return;
    invoke<[number, number]>('workspace_stats', { workspacePath })
      .then(([count, size]) => setStats({ count, size }))
      .catch(() => setStats(null));
  }, [workspacePath, files]);

  return (
    <div
      className="h-[40px] shrink-0 flex items-center justify-between px-3 border-t select-none"
      style={{
        borderColor: 'var(--border-primary)',
        backgroundColor: 'var(--bg-primary)',
      }}
    >
      {/* Left: Settings */}
      <button
        onClick={() => openSystemTab('cinder-settings')}
        className="h-[28px] w-[28px] flex items-center justify-center rounded-md transition-colors hover:bg-[var(--bg-hover)]"
        style={{ color: 'var(--text-secondary)' }}
        title="Settings"
      >
        <Settings size={15} strokeWidth={2} />
      </button>

      {/* Center: Workspace metadata */}
      {stats && (
        <span
          className="text-[10px] tabular-nums tracking-wide"
          style={{ color: 'var(--text-tertiary)' }}
        >
          {stats.count} file{stats.count !== 1 ? 's' : ''}
          <span className="mx-1.5 opacity-40">|</span>
          {formatBytes(stats.size)}
        </span>
      )}

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
  );
}
