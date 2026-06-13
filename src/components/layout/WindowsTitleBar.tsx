import { useState, useEffect } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { Minus, Square, X } from 'lucide-react';
import { isTauri } from '../../util/tauri';

/**
 * Custom title bar for Windows.
 * Replaces the native Windows title bar (which is hidden via decorations: false).
 * Provides app name, drag region, and window control buttons.
 */
export function WindowsTitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (!isTauri()) return;
    const win = getCurrentWindow();

    // Check initial state
    win
      .isMaximized()
      .then(setIsMaximized)
      .catch(() => {});

    // Listen for resize events to track maximize state
    const unlisten = win.onResized(() => {
      win
        .isMaximized()
        .then(setIsMaximized)
        .catch(() => {});
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  const handleMinimize = () => {
    if (isTauri()) getCurrentWindow().minimize();
  };

  const handleMaximize = () => {
    if (isTauri()) getCurrentWindow().toggleMaximize();
  };

  const handleClose = () => {
    if (isTauri()) getCurrentWindow().close();
  };

  return (
    <div
      data-tauri-drag-region
      className="flex items-center justify-between shrink-0 select-none"
      style={{
        height: '32px',
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--separator)',
      }}
    >
      {/* App name */}
      <div data-tauri-drag-region className="flex items-center h-full px-3">
        <span
          data-tauri-drag-region
          style={{
            fontSize: '12px',
            fontWeight: 500,
            color: 'var(--text-tertiary)',
            letterSpacing: '0.02em',
          }}
        >
          Cinder Notes
        </span>
      </div>

      {/* Window controls */}
      <div className="flex items-center h-full" data-no-drag>
        {/* Minimize */}
        <button
          onClick={handleMinimize}
          className="flex items-center justify-center h-full transition-colors hover:bg-[var(--bg-hover)]"
          style={{ width: '46px', color: 'var(--text-secondary)' }}
          title="Minimize"
        >
          <Minus size={14} strokeWidth={1.5} />
        </button>

        {/* Maximize / Restore */}
        <button
          onClick={handleMaximize}
          className="flex items-center justify-center h-full transition-colors hover:bg-[var(--bg-hover)]"
          style={{ width: '46px', color: 'var(--text-secondary)' }}
          title={isMaximized ? 'Restore' : 'Maximize'}
        >
          {isMaximized ? (
            /* Restore icon: two overlapping squares */
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
            >
              <rect x="2.5" y="3.5" width="7" height="7" rx="0.5" />
              <path d="M4.5 3.5V2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-.5.5H9" />
            </svg>
          ) : (
            <Square size={12} strokeWidth={1.5} />
          )}
        </button>

        {/* Close */}
        <button
          onClick={handleClose}
          className="flex items-center justify-center h-full transition-colors"
          style={{
            width: '46px',
            color: 'var(--text-secondary)',
          }}
          title="Close"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#e81123';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <X size={14} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
