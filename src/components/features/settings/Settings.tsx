import { useState, useEffect } from 'react';
import { isMac } from '../../../util/tauri';

interface ThemePreset {
  id: string;
  name: string;
  value: string;
  gradient: string;
  accent: string;
}

const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'cinder-dark',
    name: 'Cinder Dark',
    value: '',
    gradient: 'linear-gradient(135deg, #1f1f23 0%, #141417 100%)',
    accent: '#a1a1aa',
  },
  {
    id: 'cinder-light',
    name: 'Cinder Light',
    value: 'theme-cinder-light',
    gradient: 'linear-gradient(135deg, #fdfaf0 0%, #f2efe7 100%)',
    accent: '#52525b',
  },
  {
    id: 'zen-black',
    name: 'Zen Black',
    value: 'theme-zen-black',
    gradient: 'linear-gradient(135deg, #0a0a0a 0%, #000000 100%)',
    accent: '#333',
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

export function Settings() {
  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem('cinder-theme') || ''
  );
  const [transparencyEnabled, setTransparencyEnabled] = useState(() => {
    return localStorage.getItem('cinder-transparency') === 'true';
  });

  const isMacOS = isMac();
  const isZenBlack = currentTheme === 'theme-zen-black';

  // Apply theme
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

    // Handle transparency: Zen Black is always opaque
    if (currentTheme === 'theme-zen-black') {
      document.documentElement.classList.remove('transparency-on');
    }

    localStorage.setItem('cinder-theme', currentTheme);
  }, [currentTheme]);

  // Apply transparency
  useEffect(() => {
    if (isMacOS && transparencyEnabled && !isZenBlack) {
      document.documentElement.classList.add('transparency-on');
    } else {
      document.documentElement.classList.remove('transparency-on');
    }
    localStorage.setItem('cinder-transparency', String(transparencyEnabled));
  }, [transparencyEnabled, isMacOS, isZenBlack]);

  const handleTransparencyToggle = () => {
    setTransparencyEnabled(!transparencyEnabled);
  };

  const renderThemeButton = (theme: ThemePreset) => {
    const isActive = currentTheme === theme.value;
    return (
      <button
        key={theme.id}
        onClick={() => setCurrentTheme(theme.value || '')}
        className={`relative flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${isActive ? 'bg-[var(--bg-tertiary)] border-[var(--editor-header-accent)]' : 'bg-[var(--bg-secondary)] border-[var(--border-primary)]'} hover:bg-[var(--bg-hover)] cursor-pointer`}
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
            {THEME_PRESETS.map(renderThemeButton)}
          </div>
        </div>

        {/* Transparency toggle - macOS only */}
        {isMacOS && (
          <div className="mt-8">
            <span className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-medium">
              Transparency
            </span>
            <div className="mt-3">
              <button
                onClick={handleTransparencyToggle}
                disabled={isZenBlack}
                className={`flex items-center justify-between w-full p-4 rounded-lg border transition-colors ${
                  isZenBlack
                    ? 'opacity-40 cursor-not-allowed'
                    : 'cursor-pointer hover:bg-[var(--bg-hover)]'
                }`}
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor:
                    transparencyEnabled && !isZenBlack
                      ? 'var(--editor-header-accent)'
                      : 'var(--border-primary)',
                }}
              >
                <div className="flex flex-col items-start gap-1">
                  <span className="text-sm text-[var(--text-primary)]">
                    Window Transparency
                  </span>
                  <span className="text-[11px] text-[var(--text-tertiary)]">
                    {isZenBlack
                      ? 'Not available with Zen Black'
                      : 'Allow the desktop to show through the window'}
                  </span>
                </div>

                {/* Toggle switch */}
                <div
                  className="relative shrink-0 ml-4"
                  style={{
                    width: '36px',
                    height: '20px',
                  }}
                >
                  <div
                    className="absolute inset-0 rounded-full transition-colors duration-200"
                    style={{
                      backgroundColor:
                        transparencyEnabled && !isZenBlack
                          ? 'var(--editor-header-accent)'
                          : 'var(--bg-tertiary)',
                      border: '1px solid var(--border-secondary)',
                    }}
                  />
                  <div
                    className="absolute top-[2px] rounded-full transition-all duration-200"
                    style={{
                      width: '16px',
                      height: '16px',
                      backgroundColor: 'var(--text-primary)',
                      left: transparencyEnabled && !isZenBlack ? '18px' : '2px',
                    }}
                  />
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
