'use client';

import { useState, useEffect, useCallback } from 'react';

interface CountdownTimerProps {
    endsAt: string;
    onExpired?: () => void;
    size?: 'sm' | 'md' | 'lg';
}

export function CountdownTimer({ endsAt, onExpired, size = 'md' }: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState(getTimeLeft(endsAt));

    const tick = useCallback(() => {
        const left = getTimeLeft(endsAt);
        setTimeLeft(left);
        if (left.total <= 0) onExpired?.();
    }, [endsAt, onExpired]);

    useEffect(() => {
        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [tick]);

    const isUrgent = timeLeft.total > 0 && timeLeft.total <= 30000; // last 30 seconds
    const isExpired = timeLeft.total <= 0;

    const sizeClasses = {
        sm: 'text-sm gap-1',
        md: 'text-xl gap-2',
        lg: 'text-3xl gap-3',
    }[size];

    const blockClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-12 h-12 text-sm',
        lg: 'w-16 h-16 text-lg',
    }[size];

    if (isExpired) {
        return (
            <div className="flex items-center gap-2 text-[var(--color-accent-error)]">
                <span className="text-lg">⏰</span>
                <span className="font-bold">Süre Doldu!</span>
            </div>
        );
    }

    return (
        <div className={`flex items-center ${sizeClasses} ${isUrgent ? 'animate-[countdown-pulse_0.5s_ease-in-out_infinite]' : ''}`}>
            {timeLeft.hours > 0 && (
                <TimeBlock value={timeLeft.hours} label="sa" className={blockClasses} isUrgent={isUrgent} />
            )}
            <TimeBlock value={timeLeft.minutes} label="dk" className={blockClasses} isUrgent={isUrgent} />
            <TimeBlock value={timeLeft.seconds} label="sn" className={blockClasses} isUrgent={isUrgent} />
        </div>
    );
}

function TimeBlock({
    value, label, className, isUrgent,
}: {
    value: number; label: string; className: string; isUrgent: boolean;
}) {
    return (
        <div className={`flex flex-col items-center justify-center rounded-xl font-mono font-bold ${className} ${isUrgent
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] border border-white/5'
            }`}>
            <span>{String(value).padStart(2, '0')}</span>
            <span className="text-[8px] font-normal text-[var(--color-text-muted)] -mt-0.5">{label}</span>
        </div>
    );
}

function getTimeLeft(endsAt: string) {
    const total = Math.max(0, new Date(endsAt).getTime() - Date.now());
    return {
        total,
        hours: Math.floor(total / 3600000),
        minutes: Math.floor((total % 3600000) / 60000),
        seconds: Math.floor((total % 60000) / 1000),
    };
}
