import { useState } from 'react';
import { Palette, ChevronUp } from 'lucide-react';

const THEMES = [
  { name: 'Monokai', value: '' },
  { name: 'Dracula', value: 'theme-dracula' },
  { name: 'Nord', value: 'theme-nord' },
  { name: 'Solarized Dark', value: 'theme-solarized-dark' },
  { name: 'One Dark', value: 'theme-one-dark' },
  { name: 'Gruvbox Dark', value: 'theme-gruvbox-dark' },
  { name: 'Tokyo Night', value: 'theme-tokyo-night' },
];

export function ThemeSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('');

  const handleThemeChange = (themeValue: string) => {
    setCurrentTheme(themeValue);
    
    // Remove all theme classes
    THEMES.forEach(theme => {
      if (theme.value) {
        document.documentElement.classList.remove(theme.value);
      }
    });
    
    // Add selected theme class
    if (themeValue) {
      document.documentElement.classList.add(themeValue);
    }
    
    setIsOpen(false);
  };

  const currentThemeName = THEMES.find(t => t.value === currentTheme)?.name || 'Monokai';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 cursor-pointer rounded group transition-colors flex items-center gap-1"
        style={{ color: 'var(--text-primary)' }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        title="Theme"
      >
        <Palette size={14} className="opacity-60 group-hover:opacity-100" />
        {isOpen && <ChevronUp size={12} className="opacity-60" />}
      </button>

      {isOpen && (
        <div
          className="absolute bottom-full right-0 mb-1 rounded border shadow-lg z-50 min-w-[150px]"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-primary)',
            boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.3)',
          }}
        >
          {THEMES.map((theme) => (
            <button
              key={theme.value}
              onClick={() => handleThemeChange(theme.value)}
              className={`w-full text-left px-3 py-1.5 text-[12px] transition-colors flex items-center justify-between ${
                currentTheme === theme.value ? 'font-semibold' : ''
              }`}
              style={{
                backgroundColor: currentTheme === theme.value ? 'var(--bg-tertiary)' : 'transparent',
                color: currentTheme === theme.value ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}
              onMouseEnter={(e) => {
                if (currentTheme !== theme.value) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (currentTheme !== theme.value) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {theme.name}
              {currentTheme === theme.value && <span className="text-[10px]">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
