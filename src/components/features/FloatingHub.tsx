import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Check } from 'lucide-react';

const THEMES = [
    { name: 'Cinder Dark', value: '' },
    { name: 'Cinder Light', value: 'theme-cinder-light' },
    { name: 'Zen Black', value: 'theme-zen-black' },
];

export function FloatingHub() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentTheme, setCurrentTheme] = useState(() => localStorage.getItem('cinder-theme') || '');
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (buttonRef.current && buttonRef.current.contains(e.target as Node)) {
                return;
            }
            const target = e.target as HTMLElement;
            if (target.closest('.hub-menu')) {
                return;
            }
            setIsOpen(false);
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Apply theme to document element
    useEffect(() => {
        THEMES.forEach(t => {
            if (t.value) document.documentElement.classList.remove(t.value);
        });
        if (currentTheme) {
            document.documentElement.classList.add(currentTheme);
        }
        localStorage.setItem('cinder-theme', currentTheme);
    }, [currentTheme]);

    return (
        <>
            {/* Floating Hub Button - Fixed position at bottom-left, no background */}
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-5 left-5 z-[9998] w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ease-out group"
                style={{
                    background: 'transparent',
                    border: 'none',
                }}
                title="Cinder Hub"
            >
                <img
                    src="/icons/128%20x%20128.svg"
                    alt="Cinder Hub"
                    className="w-10 h-10 object-contain transition-transform duration-200 group-hover:scale-110"
                    style={{
                        filter: isOpen ? 'brightness(1.2) drop-shadow(0 0 8px var(--editor-header-accent))' : 'brightness(0.85)',
                    }}
                />
            </button>

            {/* Menu opens upwards from the button */}
            {isOpen && createPortal(
                <div
                    className="hub-menu fixed w-52 rounded-lg border shadow-2xl py-2 z-[9999] backdrop-blur-xl animate-in fade-in zoom-in duration-150 origin-bottom-left"
                    style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        borderColor: 'var(--border-secondary)',
                        boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
                        bottom: 80, // Position above the button (button is at bottom-5 = 20px, button height 56px + gap)
                        left: 20,   // Same as left-5
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
