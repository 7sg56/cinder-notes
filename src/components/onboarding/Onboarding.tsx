import { Flame, Folder, Plus } from 'lucide-react';
import { useState } from 'react';

interface OnboardingProps {
    onComplete: (startMode: 'new' | 'open') => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    return (
        <div
            className="h-screen w-screen flex flex-col items-center justify-center p-8 relative overflow-hidden"
            style={{
                background: 'linear-gradient(180deg, #1e1f1c 0%, #141412 100%)',
                color: 'var(--text-primary)'
            }}
        >
            {/* Decorative background glow */}
            <div
                className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none opacity-15"
                style={{ background: 'radial-gradient(circle, #e67e22 0%, transparent 70%)' }}
            />

            {/* Logo Area */}
            <div className="mb-6 relative z-10">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center relative group">
                    <div className="absolute inset-0 bg-orange-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                    <Flame
                        size={40}
                        className="text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]"
                        strokeWidth={1.5}
                    />
                </div>
            </div>

            {/* Header */}
            <h1 className="text-3xl font-light mb-3 tracking-tight text-white relative z-10">
                Welcome to <span className="font-semibold">Cinder</span>
            </h1>

            <p
                className="text-sm mb-10 max-w-sm text-center relative z-10"
                style={{ color: 'var(--text-secondary)' }}
            >
                Your personal digital forge for ideas, notes, and fragments of thought.
            </p>

            {/* Action Cards */}
            <div className="flex gap-5 relative z-10">
                {/* Create Vault Card */}
                <button
                    onClick={() => onComplete('new')}
                    onMouseEnter={() => setHoveredCard('new')}
                    onMouseLeave={() => setHoveredCard(null)}
                    className="group relative w-44 p-6 rounded-xl transition-all duration-300 border flex flex-col items-center justify-center gap-3"
                    style={{
                        backgroundColor: hoveredCard === 'new' ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                        borderColor: hoveredCard === 'new' ? 'rgba(249, 115, 22, 0.3)' : 'var(--border-secondary)',
                        transform: hoveredCard === 'new' ? 'translateY(-2px)' : 'none',
                    }}
                >
                    <div
                        className="p-3 rounded-full transition-colors duration-300"
                        style={{ backgroundColor: 'rgba(249, 115, 22, 0.1)' }}
                    >
                        <Plus className="text-orange-500" size={20} />
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                        <span className="text-sm font-medium text-white">Create Vault</span>
                        <span className="text-xs opacity-60">Start fresh locally</span>
                    </div>
                </button>

                {/* Open Folder Card */}
                <button
                    onClick={() => onComplete('open')}
                    onMouseEnter={() => setHoveredCard('open')}
                    onMouseLeave={() => setHoveredCard(null)}
                    className="group relative w-44 p-6 rounded-xl transition-all duration-300 border flex flex-col items-center justify-center gap-3"
                    style={{
                        backgroundColor: hoveredCard === 'open' ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                        borderColor: hoveredCard === 'open' ? 'rgba(249, 115, 22, 0.3)' : 'var(--border-secondary)',
                        transform: hoveredCard === 'open' ? 'translateY(-2px)' : 'none',
                    }}
                >
                    <div
                        className="p-3 rounded-full transition-colors duration-300"
                        style={{ backgroundColor: 'rgba(150, 150, 150, 0.1)' }}
                    >
                        <Folder className="text-gray-400 group-hover:text-white transition-colors" size={20} />
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                        <span className="text-sm font-medium text-white">Open Folder</span>
                        <span className="text-xs opacity-60">Import existing notes</span>
                    </div>
                </button>
            </div>
        </div>
    );
}
