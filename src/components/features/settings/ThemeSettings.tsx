import { useState, useEffect } from 'react';
import { Upload, Shuffle, Sun, Moon, Monitor, Lock } from 'lucide-react';

interface ThemePreset {
  id: string;
  name: string;
  value: string;
  gradient: string;
  accent: string;
  disabled?: boolean;
}

const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'cinder-dark',
    name: 'Cinder Dark',
    value: '',
    gradient: 'linear-gradient(135deg, #1f1f23 0%, #141417 100%)',
    accent: '#f48c25',
  },
  {
    id: 'cinder-light',
    name: 'Cinder Light',
    value: 'theme-cinder-light',
    gradient: 'linear-gradient(135deg, #fdfaf0 0%, #f2efe7 100%)',
    accent: '#d97706',
  },
  {
    id: 'zen-black',
    name: 'Zen Black',
    value: 'theme-zen-black',
    gradient: 'linear-gradient(135deg, #0a0a0a 0%, #000000 100%)',
    accent: '#333',
  },
  // New Functional Themes
  {
    id: 'synthwave',
    name: "Synthwave '84",
    value: 'theme-synthwave',
    gradient: 'linear-gradient(135deg, #2a2139 0%, #262335 100%)',
    accent: '#ff7edb',
  },
  {
    id: 'github-dark',
    name: 'GitHub Dark',
    value: 'theme-github-dark',
    gradient: 'linear-gradient(135deg, #161b22 0%, #0d1117 100%)',
    accent: '#58a6ff',
  },
  {
    id: 'monokai',
    name: 'Monokai Pro',
    value: 'theme-monokai',
    gradient: 'linear-gradient(135deg, #272822 0%, #1e1f1c 100%)',
    accent: '#a6e22e',
  },
  {
    id: 'dracula',
    name: 'Dracula',
    value: 'theme-dracula',
    gradient: 'linear-gradient(135deg, #282a36 0%, #21222c 100%)',
    accent: '#bd93f9',
  },
  {
    id: 'nord',
    name: 'Nord',
    value: 'theme-nord',
    gradient: 'linear-gradient(135deg, #3b4252 0%, #2e3440 100%)',
    accent: '#88c0d0',
  },
  {
    id: 'forest',
    name: 'Forest',
    value: 'theme-forest',
    gradient: 'linear-gradient(135deg, #273329 0%, #1e2820 100%)',
    accent: '#a7c957',
  },
  {
    id: 'mustard',
    name: 'Muddy Mustard',
    value: 'theme-mustard',
    gradient: 'linear-gradient(135deg, #3b3728 0%, #2d2a1e 100%)',
    accent: '#e9c46a',
  },
  {
    id: 'marine',
    name: 'Marine',
    value: 'theme-marine',
    gradient: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    accent: '#38bdf8',
  },
  {
    id: 'ember',
    name: 'Ember',
    value: 'theme-ember',
    gradient: 'linear-gradient(135deg, #3f1818 0%, #2b1111 100%)',
    accent: '#f87171',
  },
];

export function ThemeSettings() {
  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem('cinder-theme') || ''
  );
  const [colorMode, setColorMode] = useState<'light' | 'dark' | 'system'>(
    'dark'
  ); // Simplified for now

  // Apply theme changes
  useEffect(() => {
    // Reset classes
    THEME_PRESETS.forEach((t) => {
      if (t.value) document.documentElement.classList.remove(t.value);
    });

    // Add new theme class
    if (currentTheme) {
      document.documentElement.classList.add(currentTheme);
    }
    localStorage.setItem('cinder-theme', currentTheme);
  }, [currentTheme]);

  return (
    <div className="flex-1 overflow-y-auto w-full h-full p-8 no-scrollbar bg-[var(--bg-primary)]">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-[var(--border-primary)]">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              Themes
            </h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Manage app appearance and customization
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 border border-[var(--border-secondary)] rounded-md text-sm font-medium hover:bg-[var(--bg-hover)] text-[var(--text-primary)] flex items-center gap-2 transition-colors">
              <Upload size={16} />
              Import theme
            </button>
            <button className="px-4 py-2 border border-[var(--border-secondary)] rounded-md text-sm font-medium hover:bg-[var(--bg-hover)] text-[var(--text-primary)] flex items-center gap-2 transition-colors">
              <Shuffle size={16} />
              Set random
            </button>
          </div>
        </div>

        {/* Color Mode Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Color Mode
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Choose if app's appearance should be light or dark, or follow your
            computer's settings.
          </p>

          <div className="flex gap-4">
            {[
              { id: 'light', label: 'Light mode', icon: Sun },
              { id: 'dark', label: 'Dark mode', icon: Moon },
              { id: 'system', label: 'System', icon: Monitor },
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() =>
                  setColorMode(mode.id as 'light' | 'dark' | 'system')
                }
                className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-lg border transition-all ${
                  colorMode === mode.id
                    ? 'bg-[var(--bg-tertiary)] border-[var(--editor-header-accent)] ring-1 ring-[var(--editor-header-accent)]'
                    : 'bg-[var(--bg-secondary)] border-[var(--border-primary)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                <mode.icon
                  size={18}
                  className={
                    colorMode === mode.id
                      ? 'text-[var(--editor-header-accent)]'
                      : 'text-[var(--text-secondary)]'
                  }
                />
                <span
                  className={
                    colorMode === mode.id
                      ? 'font-medium text-[var(--text-primary)]'
                      : 'text-[var(--text-secondary)]'
                  }
                >
                  {mode.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Preset Themes Grid */}
        <div className="space-y-4 pt-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Preset themes
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Choose a preset theme from our library.
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {THEME_PRESETS.map((theme) => {
              const isActive = currentTheme === theme.value && !theme.disabled;
              return (
                <button
                  key={theme.id}
                  onClick={() =>
                    !theme.disabled && setCurrentTheme(theme.value || '')
                  }
                  disabled={theme.disabled}
                  className={`relative flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    isActive
                      ? 'bg-[var(--bg-tertiary)] border-[var(--editor-header-accent)] shadow-sm'
                      : 'bg-[var(--bg-secondary)] border-[var(--border-primary)]'
                  } ${!theme.disabled ? 'hover:bg-[var(--bg-hover)] cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                >
                  {/* Preview Circle */}
                  <div
                    className="w-10 h-10 rounded-full shrink-0 shadow-inner"
                    style={{ background: theme.gradient }}
                  />

                  <div className="min-w-0">
                    <div
                      className={`text-sm font-medium truncate ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
                    >
                      {theme.name}
                    </div>
                  </div>

                  {/* Lock icon for disabled themes */}
                  {theme.disabled && (
                    <Lock
                      size={14}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] opacity-30"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Themes (Placeholder UI) */}
        <div className="space-y-6 pt-8 border-t border-[var(--border-primary)]">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Custom themes
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Set your own app theme by changing the color for each interface
                element.
              </p>
            </div>
            {/* Toggle switch placeholder */}
            <div className="w-10 h-5 bg-[var(--bg-tertiary)] rounded-full border border-[var(--border-secondary)] relative cursor-pointer">
              <div className="absolute left-0.5 top-0.5 w-3.5 h-3.5 bg-[var(--text-tertiary)] rounded-full transition-transform" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Window background', hex: '#F1F5F9' },
              { label: 'Selected items', hex: '#F472B6' },
              { label: 'Online indication', hex: '#84CC16' },
              { label: 'Notifications', hex: '#6366F1' },
              { label: 'New inbox', hex: '#F97316' },
              { label: 'Sidebar', hex: '#7C3AED' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)]"
              >
                <div>
                  <div className="text-xs font-medium text-[var(--text-primary)] mb-1">
                    {item.label}
                  </div>
                  <div className="text-xs text-[var(--text-tertiary)] font-mono">
                    {item.hex}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-md border border-[var(--border-secondary)]"
                    style={{ backgroundColor: item.hex }}
                  />
                  <button className="px-3 py-1.5 text-xs text-[var(--text-secondary)] border border-[var(--border-secondary)] rounded hover:bg-[var(--bg-hover)] transition-colors">
                    Edit color
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
