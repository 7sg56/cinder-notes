import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Palette, Check } from 'lucide-react';

const THEMES = [
  { name: 'Cinder Dark', value: '' },
  { name: 'Cinder Light', value: 'theme-cinder-light' },
  { name: 'Zen Black', value: 'theme-zen-black' },
];

export function ThemeSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(() => localStorage.getItem('cinder-theme') || '');
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      // Position bottom-left of menu to top-left of button (opening upwards)
      setMenuPosition({
        top: rect.top, // We will offset by height in CSS or calc
        left: rect.left
      });
    }
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Check if click is on the button
      if (buttonRef.current && buttonRef.current.contains(e.target as Node)) {
        return;
      }

      // Check if click is inside the menu (we can't easily use ref here since it's a portal, 
      // but we can check if the target is inside our menu container)
      const target = e.target as HTMLElement;
      if (target.closest('.theme-switcher-menu')) {
        return;
      }

      setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Recalculate position on scroll/resize
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  // On open, calculate position
  useEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen]);

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
    <>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center p-1.5 rounded-md transition-all hover:bg-white/5 active:bg-white/10"
        style={{ color: 'var(--text-secondary)' }}
        title="Change Theme"
      >
        <Palette size={16} className={isOpen ? 'text-[var(--editor-header-accent)]' : ''} />
      </button>

      {isOpen && createPortal(
        <div
          className="theme-switcher-menu fixed w-48 rounded-lg border shadow-2xl py-2 z-[9999] backdrop-blur-xl animate-in fade-in zoom-in duration-150 origin-bottom-left"
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            borderColor: 'var(--border-secondary)',
            boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
            left: menuPosition.left,
            top: menuPosition.top,
            transform: 'translateY(-100%) translateY(-8px)' // Move up by 100% of its own height + gap
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
        </div>,
        document.body
      )}
    </>
  );
}