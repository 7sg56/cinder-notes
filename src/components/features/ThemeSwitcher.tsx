import { useState, useEffect, useRef } from 'react'; // Fixed the broken import here
import { Palette, ChevronDown, Check } from 'lucide-react';

const THEMES = [
  { name: 'Monokai', value: '' },
  { name: 'Dracula', value: 'theme-dracula' },
  { name: 'Nord', value: 'theme-nord' },
  { name: 'Tokyo Night', value: 'theme-tokyo-night' },
  { name: 'Github Light', value: 'theme-github-light' },
  { name: 'Solarized Dark', value: 'theme-solarized-dark' },
  { name: 'One Dark', value: 'theme-one-dark' },
  { name: 'Gruvbox Dark', value: 'theme-gruvbox-dark' },
  { name: 'Material Dark', value: 'theme-material-dark' },
];

export function ThemeSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(() => localStorage.getItem('cinder-theme') || '');
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Apply theme to document element
  useEffect(() => {
    // 1. Remove all possible theme classes
    THEMES.forEach(t => {
      if (t.value) document.documentElement.classList.remove(t.value);
    });
    
    // 2. Add current theme class
    if (currentTheme) {
      document.documentElement.classList.add(currentTheme);
    }
    
    // 3. Persist
    localStorage.setItem('cinder-theme', currentTheme);
  }, [currentTheme]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-md transition-all hover:bg-white/5 active:bg-white/10"
        style={{ color: 'var(--text-secondary)' }}
      >
        <Palette size={14} className={isOpen ? 'text-[var(--editor-header-accent)]' : ''} />
        <span className="text-[11px] font-semibold tracking-wide uppercase">Theme</span>
        <ChevronDown size={12} className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-[var(--editor-header-accent)]' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="absolute top-[calc(100%+8px)] right-0 w-48 rounded-lg border shadow-2xl py-2 z-[999] backdrop-blur-xl animate-in fade-in zoom-in duration-150"
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            borderColor: 'var(--border-secondary)',
            boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.5)'
          }}
        >
          <div className="px-3 pb-2 mb-1 border-b text-[10px] uppercase tracking-widest font-bold opacity-30" style={{ borderColor: 'var(--border-primary)' }}>
            Studio Themes
          </div>
          
          <div className="max-h-[300px] overflow-y-auto no-scrollbar">
            {THEMES.map((theme) => (
              <button
                key={theme.name}
                onClick={() => {
                  setCurrentTheme(theme.value);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-[12px] hover:bg-white/5 transition-colors group"
                style={{
                  color: currentTheme === theme.value ? 'var(--editor-header-accent)' : 'var(--text-primary)'
                }}
              >
                <span className={currentTheme === theme.value ? 'font-bold' : 'font-medium'}>
                  {theme.name}
                </span>
                {currentTheme === theme.value && <Check size={14} strokeWidth={3} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}