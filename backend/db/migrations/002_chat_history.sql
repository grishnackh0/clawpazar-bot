-- Chat History table for multi-channel conversation persistence
-- Stores Telegram, WhatsApp, and Web chat messages

CREATE TABLE IF NOT EXISTS chat_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id TEXT NOT NULL,           -- Telegram chat.id or WhatsApp phone
    channel TEXT NOT NULL CHECK (channel IN ('telegram', 'whatsapp', 'web')),
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast history retrieval per conversation
CREATE INDEX IF NOT EXISTS idx_chat_history_conversation
ON chat_history (chat_id, channel, created_at DESC);

-- Auto-cleanup: delete messages older than 30 days (KVKK compliance)
-- Run as a cron job: DELETE FROM chat_history WHERE created_at < NOW() - INTERVAL '30 days';
