import { useState, useEffect } from 'react';
import { ChevronDown, Lock } from 'lucide-react';

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

const THEME_VARIABLES = [
  '--bg-primary',
  '--bg-secondary',
  '--bg-tertiary',
  '--bg-hover',
  '--bg-active',
  '--text-primary',
  '--text-secondary',
  '--text-tertiary',
  '--editor-header-accent',
  '--accent-glow',
  '--border-primary',
  '--border-secondary',
  '--markdown-heading',
  '--markdown-link',
  '--markdown-code',
  '--markdown-code-bg',
  '--editor-bg',
  '--editor-text',
  '--editor-selection-bg',
  '--activity-bar-bg',
];

const MAIN_THEMES = ['cinder-dark', 'cinder-light', 'zen-black'];

export function Settings() {
  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem('cinder-theme') || ''
  );
  const [showAllThemes, setShowAllThemes] = useState(false);

  useEffect(() => {
    THEME_PRESETS.forEach((t) => {
      if (t.value) document.documentElement.classList.remove(t.value);
    });

    THEME_VARIABLES.forEach((v) =>
      document.documentElement.style.removeProperty(v)
    );

    if (currentTheme) {
      document.documentElement.classList.add(currentTheme);
    }
    localStorage.setItem('cinder-theme', currentTheme);
  }, [currentTheme]);

  const renderThemeButton = (theme: ThemePreset) => {
    const isActive = currentTheme === theme.value && !theme.disabled;
    return (
      <button
        key={theme.id}
        onClick={() => !theme.disabled && setCurrentTheme(theme.value || '')}
        disabled={theme.disabled}
        className={`relative flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${isActive ? 'bg-[var(--bg-tertiary)] border-[var(--editor-header-accent)]' : 'bg-[var(--bg-secondary)] border-[var(--border-primary)]'} ${!theme.disabled ? 'hover:bg-[var(--bg-hover)] cursor-pointer' : 'opacity-40 cursor-not-allowed'}`}
      >
        <div
          className="w-8 h-8 rounded-full shrink-0"
          style={{ background: theme.gradient }}
        />
        <span
          className={`text-sm truncate ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
        >
          {theme.name}
        </span>
        {theme.disabled && (
          <Lock
            size={12}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
          />
        )}
      </button>
    );
  };

  return (
    <div className="flex-1 h-full bg-[var(--bg-primary)] overflow-y-auto no-scrollbar">
      <div className="max-w-xl mx-auto px-8 py-10">
        <h1 className="text-lg font-semibold text-[var(--text-primary)]">
          Settings
        </h1>
        <p className="mt-1 text-xs text-[var(--text-tertiary)]">Appearance</p>

        {/* Theme grid */}
        <div className="mt-8">
          <span className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-medium">
            Themes
          </span>
          <div className="grid grid-cols-2 gap-3 mt-3">
            {THEME_PRESETS.filter((t) => MAIN_THEMES.includes(t.id)).map(
              renderThemeButton
            )}
          </div>
        </div>

        {/* Other themes */}
        <div className="mt-6">
          <button
            onClick={() => setShowAllThemes(!showAllThemes)}
            className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
          >
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${showAllThemes ? 'rotate-180' : ''}`}
            />
            {showAllThemes ? 'Hide other themes' : 'More themes'}
          </button>

          {showAllThemes && (
            <div className="grid grid-cols-2 gap-3 mt-3">
              {THEME_PRESETS.filter((t) => !MAIN_THEMES.includes(t.id)).map(
                renderThemeButton
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
