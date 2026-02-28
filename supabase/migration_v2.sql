-- ClawPazar Migration V2 — State Migration to Supabase
-- Moves all writeFileSync/Map-based state to PostgreSQL

-- ═══════════════════════════════════════════════
-- 1. EVENTS (MerkleTree + Hash Chain)
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  ts BIGINT NOT NULL,
  type TEXT NOT NULL,
  user_id BIGINT NOT NULL,
  agent TEXT,
  data JSONB DEFAULT '{}',
  prev_hash TEXT NOT NULL,
  hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_user ON events (user_id, ts DESC);
CREATE INDEX IF NOT EXISTS idx_events_type ON events (type);

-- ═══════════════════════════════════════════════
-- 2. CHAT HISTORY (if not exists from v1)
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'telegram',
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_history_conversation
ON chat_history (chat_id, channel, created_at DESC);

-- ═══════════════════════════════════════════════
-- 3. LISTING DRAFTS (İlan Taslakları)
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS listing_drafts (
  chat_id BIGINT PRIMARY KEY,
  category TEXT,
  model TEXT,
  condition TEXT,
  price NUMERIC,
  city TEXT,
  step TEXT NOT NULL DEFAULT 'category',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════
-- 4. USER MEMORY (IntentMemory profilleri)
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS user_memory (
  user_id BIGINT PRIMARY KEY,
  preferred_categories JSONB DEFAULT '{}',
  price_range_min NUMERIC DEFAULT 0,
  price_range_max NUMERIC DEFAULT 100000,
  city TEXT DEFAULT '',
  interests TEXT[] DEFAULT '{}',
  total_interactions INT DEFAULT 0,
  last_seen BIGINT,
  buyer_score REAL DEFAULT 0.5,
  seller_score REAL DEFAULT 0.5,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════
-- 5. TRUST SCORES (TrustEngine)
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS trust_scores (
  user_id BIGINT PRIMARY KEY,
  score REAL DEFAULT 1.0,
  overrides INT DEFAULT 0,
  successes INT DEFAULT 0,
  last_update BIGINT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════
-- 6. KVKK CONSENTS
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS kvkk_consents (
  user_id BIGINT PRIMARY KEY,
  types TEXT[] DEFAULT '{}',
  granted_at BIGINT,
  version TEXT DEFAULT '1.0',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════
-- 7. ACTIVE AGENTS (per chat)
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS active_agents (
  chat_id BIGINT PRIMARY KEY,
  agent TEXT NOT NULL DEFAULT 'general',
  updated_at TIMESTAMPTZ DEFAULT now()
);
