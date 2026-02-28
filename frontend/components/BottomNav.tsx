'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Zap, PawPrint, User } from 'lucide-react';

const tabs = [
    { href: '/', icon: Home, label: 'Ana Sayfa' },
    { href: '/kesfet', icon: Search, label: 'Keşfet' },
    { href: '/sohbet', icon: PawPrint, label: 'Sat', isCenter: true },
    { href: '/mezat', icon: Zap, label: 'Mezat' },
    { href: '/profil', icon: User, label: 'Profil' },
];

export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 glass pb-safe">
            <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-1.5">
                {tabs.map((tab) => {
                    const isActive = tab.href === '/'
                        ? pathname === '/'
                        : pathname === tab.href || pathname?.startsWith(tab.href + '/');
                    const Icon = tab.icon;

                    if (tab.isCenter) {
                        return (
                            <Link
                                key="center"
                                href={tab.href}
                                className="flex -mt-6 h-[56px] w-[56px] items-center justify-center rounded-full neon-btn animate-neon-pulse transition-transform active:scale-90 vhs-glitch"
                            >
                                <Icon className="w-6 h-6 text-white icon-neon" strokeWidth={2.5} />
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={tab.href + tab.label}
                            href={tab.href}
                            className={`flex flex-col items-center gap-0.5 px-3 py-2 transition-all duration-200 group ${isActive
                                ? 'text-[var(--neon-cyan)]'
                                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
                                }`}
                        >
                            <Icon
                                className={`w-5 h-5 transition-all ${isActive ? 'icon-neon' : 'group-hover:icon-neon'}`}
                                strokeWidth={isActive ? 2.5 : 1.5}
                            />
                            <span className="text-[10px] font-medium tracking-wide">{tab.label}</span>
                            {isActive && (
                                <div className="h-0.5 w-5 rounded-full bg-[var(--neon-cyan)] shadow-[0_0_8px_rgba(0,240,255,0.5)] mt-0.5" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
