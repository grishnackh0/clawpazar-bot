'use client';

import { AgentChat } from '@/components/AgentChat';

export default function SohbetPage() {
    return (
        <div className="fixed inset-0 flex flex-col bg-[var(--color-surface-base)]">
            <AgentChat />
        </div>
    );
}
