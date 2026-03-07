import { FilePlus, FolderOpen, Settings, Command, Blocks } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export function WelcomePage() {
  const { createNewTab } = useAppStore();

  const sections = [
    {
      title: 'Get Started',
      items: [
        {
          icon: FilePlus,
          label: 'New File',
          shortcut: 'Ctrl+N',
          action: createNewTab,
        },
        {
          icon: FolderOpen,
          label: 'Open Project',
          shortcut: 'Ctrl+O',
          action: () => {},
        },
        {
          icon: Command,
          label: 'Open Command Palette',
          shortcut: 'Ctrl+Shift+P',
          action: () => {},
        },
      ],
    },
    {
      title: 'Configure',
      items: [
        {
          icon: Settings,
          label: 'Open Settings',
          shortcut: 'Ctrl+,',
          action: () => {},
        },
        {
          icon: Blocks,
          label: 'Explore Extensions',
          shortcut: 'Ctrl+Shift+X',
          action: () => {},
        },
      ],
    },
  ];

  return (
    <div
      className="h-full w-full flex flex-col items-center justify-center select-none relative"
      style={{ backgroundColor: 'var(--editor-bg)' }}
    >
      {/* Main Centered Content Wrapper */}
      <div className="flex flex-col items-center w-full max-w-[400px]">
        {/* Actions List */}
        <div className="w-full space-y-12">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-4">
              <h2
                className="text-[10px] font-bold uppercase tracking-[0.2em] px-3 transition-colors"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {section.title}
              </h2>
              <div className="space-y-1">
                {section.items.map((item, itemIdx) => (
                  <button
                    key={itemIdx}
                    onClick={item.action}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-md group transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <item.icon
                        size={18}
                        className="opacity-60 group-hover:opacity-100"
                      />
                      <span className="text-[13px] font-medium">
                        {item.label}
                      </span>
                    </div>
                    {item.shortcut && (
                      <div className="flex gap-1 items-center">
                        {item.shortcut.split('+').map((key) => (
                          <kbd
                            key={key}
                            className="min-w-[20px] h-[18px] flex items-center justify-center text-[9px] rounded px-1 border transition-colors"
                            style={{
                              backgroundColor: 'var(--bg-secondary)',
                              borderColor: 'var(--border-primary)',
                              color: 'var(--text-tertiary)',
                            }}
                          >
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
        <button
          className="text-[11px] transition-colors"
          style={{ color: 'var(--text-tertiary)' }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = 'var(--text-secondary)')
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = 'var(--text-tertiary)')
          }
        >
          Return to Onboarding
        </button>
      </div>
    </div>
  );
}
