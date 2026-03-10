import { useState, useEffect } from 'react';
import {
  Sun,
  Moon,
  Monitor,
  Lock,
  Settings as SettingsIcon,
  Palette,
  Bell,
  FolderOpen,
  Globe,
  Save,
  ChevronDown,
} from 'lucide-react';

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

export function Settings() {
  const [activeTab, setActiveTab] = useState<'general' | 'theme'>('general');
  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem('cinder-theme') || ''
  );
  const [colorMode, setColorMode] = useState<'light' | 'dark' | 'system'>(
    'dark'
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

  return (
    <div className="flex-1 flex justify-center h-full bg-[var(--bg-primary)] overflow-hidden">
      <div className="w-full max-w-5xl flex h-full border-x border-[var(--border-primary)] shadow-sm">
        {/* Sidebar-style Tabs */}
        <div className="w-64 border-r border-[var(--border-primary)] bg-[var(--bg-secondary)] flex flex-col p-4 gap-2">
          <h2 className="px-3 py-2 text-[10px] uppercase tracking-widest font-bold opacity-30">
            Settings
          </h2>
          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'general' ? 'bg-[var(--bg-active)] text-[var(--editor-header-accent)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'}`}
          >
            <SettingsIcon size={16} />
            General
          </button>
          <button
            onClick={() => setActiveTab('theme')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'theme' ? 'bg-[var(--bg-active)] text-[var(--editor-header-accent)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'}`}
          >
            <Palette size={16} />
            Appearance
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
          <div className="max-w-2xl mx-auto">
            {activeTab === 'general' ? (
              <div className="space-y-10">
                <div className="pb-6 border-b border-[var(--border-primary)]">
                  <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                    General Settings
                  </h1>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    Customize your editor experience
                  </p>
                </div>

                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                    Editor
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)] opacity-60">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-[var(--bg-tertiary)] rounded-md text-[var(--text-secondary)]">
                          <Save size={20} />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2">
                            Auto-save
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[var(--text-secondary)] px-1.5 py-0.5 rounded">
                              Coming Soon
                            </span>
                          </h3>
                          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                            Automatically save changes while typing
                          </p>
                        </div>
                      </div>
                      <button
                        disabled
                        className="w-10 h-6 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-full relative cursor-not-allowed"
                      >
                        <div className="w-4 h-4 bg-[var(--text-tertiary)] rounded-full absolute left-1 top-[3px]" />
                      </button>
                    </div>

                    {[
                      {
                        icon: Monitor,
                        title: 'Default View',
                        desc: 'Choose default view for new files',
                        options: ['Split View', 'Editor Only', 'Preview Only'],
                      },
                      {
                        icon: FolderOpen,
                        title: 'Sidebar Position',
                        desc: 'Change the location of the sidebar',
                        options: ['Left', 'Right'],
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)]"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-[var(--bg-tertiary)] rounded-md text-[var(--text-secondary)]">
                            <item.icon size={20} />
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-[var(--text-primary)]">
                              {item.title}
                            </h3>
                            <p className="text-xs text-[var(--text-secondary)]">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                        <select className="px-3 py-1.5 text-xs font-medium border border-[var(--border-secondary)] rounded hover:bg-[var(--bg-hover)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] outline-none transition-all">
                          {item.options.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>

                  <h2 className="text-lg font-semibold text-[var(--text-primary)] mt-8">
                    System
                  </h2>
                  <div className="space-y-3">
                    {[
                      {
                        icon: Globe,
                        title: 'Language',
                        desc: 'Change interface language',
                        options: [
                          'English',
                          'Spanish',
                          'French',
                          'German',
                          'Japanese',
                        ],
                      },
                      {
                        icon: Bell,
                        title: 'Notifications',
                        desc: 'Configure desktop notifications',
                        options: ['All', 'Important Only', 'None'],
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)]"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-[var(--bg-tertiary)] rounded-md text-[var(--text-secondary)]">
                            <item.icon size={20} />
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-[var(--text-primary)]">
                              {item.title}
                            </h3>
                            <p className="text-xs text-[var(--text-secondary)]">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                        <select className="px-3 py-1.5 text-xs font-medium border border-[var(--border-secondary)] rounded hover:bg-[var(--bg-hover)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] outline-none transition-all">
                          {item.options.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-10">
                <div className="pb-6 border-b border-[var(--border-primary)]">
                  <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                    Themes
                  </h1>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    Manage app appearance and customization
                  </p>
                </div>

                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                    Color Mode
                  </h2>
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
                        className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-lg border transition-all ${colorMode === mode.id ? 'bg-[var(--bg-tertiary)] border-[var(--editor-header-accent)] ring-1 ring-[var(--editor-header-accent)]' : 'bg-[var(--bg-secondary)] border-[var(--border-primary)] hover:bg-[var(--bg-hover)]'}`}
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

                <div className="space-y-4 pt-4">
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                    Main Themes
                  </h2>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {THEME_PRESETS.filter((t) =>
                      ['cinder-dark', 'cinder-light', 'zen-black'].includes(
                        t.id
                      )
                    ).map((theme) => {
                      const isActive =
                        currentTheme === theme.value && !theme.disabled;
                      return (
                        <button
                          key={theme.id}
                          onClick={() =>
                            !theme.disabled &&
                            setCurrentTheme(theme.value || '')
                          }
                          disabled={theme.disabled}
                          className={`relative flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${isActive ? 'bg-[var(--bg-tertiary)] border-[var(--editor-header-accent)] shadow-sm' : 'bg-[var(--bg-secondary)] border-[var(--border-primary)]'} ${!theme.disabled ? 'hover:bg-[var(--bg-hover)] cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                        >
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

                  <div className="pt-4">
                    <button
                      onClick={() => setShowAllThemes(!showAllThemes)}
                      className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-4 focus:outline-none"
                    >
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${showAllThemes ? 'rotate-180' : ''}`}
                      />
                      {showAllThemes
                        ? 'Hide other themes'
                        : 'Show other themes'}
                    </button>

                    {showAllThemes && (
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                        {THEME_PRESETS.filter(
                          (t) =>
                            ![
                              'cinder-dark',
                              'cinder-light',
                              'zen-black',
                            ].includes(t.id)
                        ).map((theme) => {
                          const isActive =
                            currentTheme === theme.value && !theme.disabled;
                          return (
                            <button
                              key={theme.id}
                              onClick={() =>
                                !theme.disabled &&
                                setCurrentTheme(theme.value || '')
                              }
                              disabled={theme.disabled}
                              className={`relative flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${isActive ? 'bg-[var(--bg-tertiary)] border-[var(--editor-header-accent)] shadow-sm' : 'bg-[var(--bg-secondary)] border-[var(--border-primary)]'} ${!theme.disabled ? 'hover:bg-[var(--bg-hover)] cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                            >
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
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
