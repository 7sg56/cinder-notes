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
    <div className="flex-1 h-full bg-[var(--bg-primary)] overflow-y-auto no-scrollbar">
      <div className="max-w-xl mx-auto px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-[var(--text-primary)]">
              Trash
            </h1>
            <p className="mt-1 text-xs text-[var(--text-tertiary)]">
              {items.length === 0
                ? 'No items'
                : `${items.length} item${items.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          {items.length > 0 && (
            <button
              onClick={handleEmptyTrash}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
              title="Permanently delete all items"
            >
              <Trash2 size={12} />
              Empty
            </button>
          )}
        </div>

        {/* Content */}
        <div className="mt-6">
          {loading ? (
            <p className="text-xs text-[var(--text-tertiary)] py-8 text-center">
              Loading...
            </p>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center py-16 opacity-30">
              <Trash2
                size={32}
                strokeWidth={1}
                className="text-[var(--text-tertiary)]"
              />
              <p className="text-xs text-[var(--text-tertiary)] mt-3">
                Trash is empty
              </p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {items.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--bg-hover)] transition-colors group"
                >
                  {entry.entry_type === 'folder' ? (
                    <Folder
                      size={15}
                      className="shrink-0 text-[var(--text-tertiary)]"
                    />
                  ) : (
                    <FileText
                      size={15}
                      className="shrink-0 text-[var(--text-tertiary)]"
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate text-[var(--text-primary)]">
                      {entry.original_name}
                    </div>
                    <div className="text-[11px] text-[var(--text-tertiary)] truncate">
                      {entry.relative_path}
                    </div>
                  </div>

                  <span className="text-[10px] text-[var(--text-tertiary)] shrink-0 tabular-nums">
                    {timeAgo(entry.trashed_at)}
                  </span>

                  <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleRestore(entry)}
                      className="p-1 rounded hover:bg-[var(--bg-active)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
                      title="Restore"
                    >
                      <RotateCcw size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(entry)}
                      className="p-1 rounded hover:bg-[var(--bg-active)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
                      title="Delete permanently"
                    >
                      <X size={13} />
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
