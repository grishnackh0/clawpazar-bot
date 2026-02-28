'use client';

interface WatermarkBadgeProps {
    size?: 'sm' | 'md';
    showTooltip?: boolean;
}

export function WatermarkBadge({ size = 'md', showTooltip = false }: WatermarkBadgeProps) {
    const sizeClasses = size === 'sm'
        ? 'text-[10px] px-1.5 py-0.5 gap-0.5'
        : 'text-xs px-2 py-1 gap-1';

    return (
        <div className="group relative inline-flex">
            <span
                className={`inline-flex items-center rounded-full bg-violet-500/20 font-medium text-violet-300 border border-violet-500/30 backdrop-blur-sm ${sizeClasses}`}
            >
                <span>🤖</span>
                <span>AI</span>
            </span>

            {showTooltip && (
                <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 rounded-lg bg-[var(--color-surface-elevated)] px-3 py-2 text-[11px] text-[var(--color-text-secondary)] opacity-0 shadow-lg transition-opacity group-hover:opacity-100 whitespace-nowrap border border-white/5">
                    Yapay Zeka Tarafından Üretilmiştir
                    <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-[var(--color-surface-elevated)] border-r border-b border-white/5" />
                </div>
            )}
        </div>
    );
}
