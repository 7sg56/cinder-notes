import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { emit } from '@tauri-apps/api/event';
import { Trash2, FileText, Folder, RotateCcw, X } from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';

interface TrashEntry {
  id: string;
  original_name: string;
  original_path: string;
  relative_path: string;
  trashed_name: string;
  trashed_at: string;
  entry_type: string;
}

function timeAgo(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export function TrashView() {
  const workspacePath = useAppStore((s) => s.workspacePath);
  const [items, setItems] = useState<TrashEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshTrash = useCallback(async () => {
    if (!workspacePath) return;
    try {
      const entries = await invoke<TrashEntry[]>('list_trash', {
        workspacePath,
      });
      // Sort by most recently trashed first
      entries.sort(
        (a, b) =>
          new Date(b.trashed_at).getTime() - new Date(a.trashed_at).getTime()
      );
      setItems(entries);
    } catch (err) {
      console.error('Failed to load trash:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [workspacePath]);

  useEffect(() => {
    refreshTrash();
  }, [refreshTrash]);

  const handleRestore = async (entry: TrashEntry) => {
    if (!workspacePath) return;
    try {
      await invoke('restore_trash_item', { workspacePath, trashId: entry.id });
      await refreshTrash();
      await emit('workspace-changed');
    } catch (err) {
      console.error('Failed to restore:', err);
    }
  };

  const handleDelete = async (entry: TrashEntry) => {
    if (!workspacePath) return;
    try {
      await invoke('delete_trash_item', { workspacePath, trashId: entry.id });
      await refreshTrash();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const handleEmptyTrash = async () => {
    if (!workspacePath) return;
    try {
      await invoke('empty_trash', { workspacePath });
      await refreshTrash();
    } catch (err) {
      console.error('Failed to empty trash:', err);
    }
  };

  return (
    <div className="flex-1 flex justify-center h-full bg-[var(--bg-primary)] overflow-hidden">
      <div className="w-full max-w-3xl flex flex-col h-full border-x border-[var(--border-primary)] shadow-sm">
        {/* Header */}
        <div className="shrink-0 p-8 pb-6 border-b border-[var(--border-primary)]">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                Trash
              </h1>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                {items.length === 0
                  ? 'No items in trash'
                  : `${items.length} item${items.length !== 1 ? 's' : ''} in trash`}
              </p>
            </div>
            {items.length > 0 && (
              <button
                onClick={handleEmptyTrash}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-[var(--bg-hover)] border border-[var(--border-primary)]"
                style={{ color: 'var(--text-secondary)' }}
                title="Permanently delete all items"
              >
                <Trash2 size={13} />
                Empty Trash
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-sm text-[var(--text-tertiary)]">Loading...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 opacity-40">
              <Trash2
                size={48}
                strokeWidth={1}
                style={{ color: 'var(--text-tertiary)' }}
              />
              <p
                className="text-sm font-medium"
                style={{ color: 'var(--text-tertiary)' }}
              >
                Trash is empty
              </p>
            </div>
          ) : (
            <div>
              {items.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-4 px-8 py-3.5 border-b transition-colors hover:bg-[var(--bg-hover)] group"
                  style={{ borderColor: 'var(--border-primary)' }}
                >
                  {/* Icon */}
                  <div
                    className="p-2 rounded-lg shrink-0"
                    style={{ backgroundColor: 'var(--bg-tertiary)' }}
                  >
                    {entry.entry_type === 'folder' ? (
                      <Folder
                        size={18}
                        style={{ color: 'var(--text-secondary)' }}
                      />
                    ) : (
                      <FileText
                        size={18}
                        style={{ color: 'var(--text-secondary)' }}
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate text-[var(--text-primary)]">
                      {entry.original_name}
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)] truncate mt-0.5">
                      {entry.relative_path}
                    </div>
                  </div>

                  {/* Time */}
                  <span className="text-[11px] text-[var(--text-tertiary)] shrink-0 tabular-nums">
                    {timeAgo(entry.trashed_at)}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleRestore(entry)}
                      className="p-1.5 rounded-md transition-colors hover:bg-[var(--bg-active)]"
                      style={{ color: 'var(--text-secondary)' }}
                      title="Restore to original location"
                    >
                      <RotateCcw size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(entry)}
                      className="p-1.5 rounded-md transition-colors hover:bg-[var(--bg-active)]"
                      style={{ color: 'var(--text-tertiary)' }}
                      title="Delete permanently"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
