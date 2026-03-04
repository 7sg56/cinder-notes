import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { User, Palette, Settings } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export function FloatingHub() {
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const buttonRef = useRef<HTMLDivElement>(null);
    const { openSystemTab } = useAppStore();

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

    return (
        <>
            {/* Floating Hub Button - Circular Div */}
            <div
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                role="button"
                className="fixed bottom-5 left-5 z-[99999] w-14 h-14 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 ease-out group shadow-xl hover:scale-110 active:scale-95"
                style={{
                    backgroundColor: 'var(--bg-tertiary)', // Provide a background
                    border: isOpen || isHovered ? '1px solid var(--editor-header-accent)' : '1px solid var(--border-primary)',
                    boxShadow: isOpen || isHovered ? '0 0 15px var(--accent-glow)' : 'none',
                    overflow: 'hidden' // Clip the square image to circle
                }}
                title="Cinder Hub"
            >
                <img
                    src="src-tauri/icons/Square44x44Logo.png"
                    alt="Cinder Hub"
                    className="w-full h-full object-cover"
                    style={{
                        filter: isOpen ? 'brightness(1.1)' : 'brightness(1)',
                    }}
                />
            </div>

            {/* Menu opens upwards from the button */}
            {isOpen && createPortal(
                <div
                    className="hub-menu fixed w-52 rounded-lg border shadow-2xl py-2 z-[100000] backdrop-blur-xl animate-in fade-in zoom-in duration-150 origin-bottom-left"
                    style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        borderColor: 'var(--border-secondary)',
                        boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
                        bottom: 80, // Position above the button (button is at bottom-5 = 20px, button height 56px + gap)
                        left: 20,   // Same as left-5
                    }}
                >
                    <div className="px-3 pb-2 mb-1 border-b text-[10px] uppercase tracking-widest font-bold opacity-30" style={{ borderColor: 'var(--border-primary)' }}>
                        Cinder Hub
                    </div>

                    <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                        <button
                            onClick={() => {
                                openSystemTab('cinder-account');
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center justify-between px-3 py-2 text-[12px] hover:bg-[var(--bg-hover)] transition-colors group"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            <span className="font-medium flex items-center gap-2">
                                <User size={14} />
                                Account
                            </span>
                        </button>
                        <button
                            onClick={() => {
                                openSystemTab('cinder-theme');
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center justify-between px-3 py-2 text-[12px] hover:bg-[var(--bg-hover)] transition-colors group"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            <span className="font-medium flex items-center gap-2">
                                <Palette size={14} />
                                Themes
                            </span>
                        </button>
                        <button
                            onClick={() => {
                                openSystemTab('cinder-settings');
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center justify-between px-3 py-2 text-[12px] hover:bg-[var(--bg-hover)] transition-colors group"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            <span className="font-medium flex items-center gap-2">
                                <Settings size={14} />
                                Settings
                            </span>
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
