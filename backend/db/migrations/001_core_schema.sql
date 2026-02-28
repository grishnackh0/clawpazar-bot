-- ClawPazar Database Schema
-- Migration 001: Core Tables
-- PostgreSQL 15+ with pgvector extension

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";       -- pgvector for semantic search
CREATE EXTENSION IF NOT EXISTS "pgcrypto";     -- for gen_random_bytes

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE user_role AS ENUM ('buyer', 'seller', 'admin', 'moderator');
CREATE TYPE vendor_status AS ENUM ('pending_kyc', 'active', 'suspended', 'banned');
CREATE TYPE listing_status AS ENUM ('draft', 'pending_review', 'active', 'sold', 'expired', 'removed');
CREATE TYPE order_status AS ENUM ('created', 'payment_pending', 'payment_completed', 'shipped', 'delivered', 'completed', 'cancelled', 'disputed', 'refunded');
CREATE TYPE escrow_status AS ENUM ('holding', 'released', 'refunded', 'disputed');
CREATE TYPE auction_status AS ENUM ('scheduled', 'active', 'ended', 'cancelled');
CREATE TYPE negotiation_status AS ENUM ('open', 'counter_offered', 'accepted', 'rejected', 'expired');
CREATE TYPE payment_method AS ENUM ('iyzico_card', 'iyzico_bkm', 'btcpay_disabled');
CREATE TYPE content_source AS ENUM ('user', 'ai_generated', 'ai_enhanced');
CREATE TYPE channel_type AS ENUM ('whatsapp', 'telegram', 'web', 'api');
CREATE TYPE consent_type AS ENUM ('kvkk_general', 'marketing', 'data_sharing', 'ai_processing');
CREATE TYPE takedown_status AS ENUM ('pending', 'reviewed', 'removed', 'rejected');

-- ============================================================
-- 1. USERS & AUTH
-- ============================================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supabase_auth_id UUID UNIQUE NOT NULL,  -- links to Supabase GoTrue
    email           VARCHAR(255) UNIQUE,
    phone           VARCHAR(20) UNIQUE,
    display_name    VARCHAR(100) NOT NULL,
    avatar_url      TEXT,
    role            user_role DEFAULT 'buyer',
    preferred_channel channel_type DEFAULT 'web',
    locale          VARCHAR(5) DEFAULT 'tr-TR',
    is_verified     BOOLEAN DEFAULT FALSE,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_email ON users(email);

-- ============================================================
-- 2. VENDORS (Sellers / Sub-merchants)
-- ============================================================
CREATE TABLE vendors (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    store_name          VARCHAR(200) NOT NULL,
    store_slug          VARCHAR(200) UNIQUE NOT NULL,
    status              vendor_status DEFAULT 'pending_kyc',
    -- iyzico sub-merchant fields
    iyzico_sub_merchant_key VARCHAR(255),
    iyzico_sub_merchant_type VARCHAR(20) DEFAULT 'PERSONAL', -- PERSONAL | PRIVATE_COMPANY | LIMITED_OR_JOINT_STOCK_COMPANY
    identity_number     VARCHAR(11),    -- TC Kimlik No (encrypted at app level)
    tax_number          VARCHAR(10),
    tax_office          VARCHAR(100),
    iban                VARCHAR(34),
    legal_company_title VARCHAR(255),
    -- address
    address             TEXT,
    city                VARCHAR(50),
    district            VARCHAR(50),
    -- stats
    total_sales         INTEGER DEFAULT 0,
    avg_rating          NUMERIC(3,2) DEFAULT 0,
    commission_rate     NUMERIC(5,4) DEFAULT 0.0500, -- 5% default
    -- timestamps
    kyc_verified_at     TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_vendor_user UNIQUE (user_id)
);

CREATE INDEX idx_vendors_status ON vendors(status);
CREATE INDEX idx_vendors_slug ON vendors(store_slug);

-- ============================================================
-- 3. CATEGORIES
-- ============================================================
CREATE TABLE categories (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id   UUID REFERENCES categories(id),
    name_tr     VARCHAR(100) NOT NULL,
    name_en     VARCHAR(100),
    slug        VARCHAR(100) UNIQUE NOT NULL,
    icon        VARCHAR(50),
    sort_order  INTEGER DEFAULT 0,
    is_active   BOOLEAN DEFAULT TRUE,
    metadata    JSONB DEFAULT '{}',
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Seed top-level categories
INSERT INTO categories (name_tr, slug, icon, sort_order) VALUES
    ('Elektronik', 'elektronik', '📱', 1),
    ('Moda', 'moda', '👗', 2),
    ('Ev & Yaşam', 'ev-yasam', '🏠', 3),
    ('Aksesuar', 'aksesuar', '⌚', 4),
    ('Koleksiyon', 'koleksiyon', '🎭', 5),
    ('Spor & Outdoor', 'spor-outdoor', '⚽', 6);

-- ============================================================
-- 4. LISTINGS (Products/İlanlar)
-- ============================================================
CREATE TABLE listings (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id       UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    category_id     UUID REFERENCES categories(id),
    -- content
    title           VARCHAR(200) NOT NULL,
    description     TEXT NOT NULL,
    price           NUMERIC(12,2) NOT NULL CHECK (price >= 0),
    currency        VARCHAR(3) DEFAULT 'TRY',
    condition       VARCHAR(20) DEFAULT 'used', -- new, like_new, used, fair, poor
    -- AI metadata
    content_source  content_source DEFAULT 'user',
    ai_generated_fields JSONB DEFAULT '{}',  -- tracks which fields were AI-generated
    ai_confidence_score NUMERIC(3,2),
    -- media
    images          JSONB DEFAULT '[]',  -- [{url, is_ai_generated, watermark_hash}]
    thumbnail_url   TEXT,
    -- search
    embedding       vector(1536),  -- pgvector for semantic search
    search_text     TSVECTOR,      -- full-text search
    -- status
    status          listing_status DEFAULT 'draft',
    is_auction      BOOLEAN DEFAULT FALSE,
    requires_human_review BOOLEAN DEFAULT FALSE, -- >10k TL trigger
    reviewed_by     UUID REFERENCES users(id),
    reviewed_at     TIMESTAMPTZ,
    -- location
    city            VARCHAR(50),
    district        VARCHAR(50),
    -- engagement
    view_count      INTEGER DEFAULT 0,
    favorite_count  INTEGER DEFAULT 0,
    -- channel info
    source_channel  channel_type DEFAULT 'web',
    -- timestamps
    published_at    TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- High-value trigger: auto-set requires_human_review
CREATE OR REPLACE FUNCTION check_high_value_listing()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.price > 10000 THEN
        NEW.requires_human_review := TRUE;
        NEW.status := 'pending_review';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_high_value_listing
    BEFORE INSERT OR UPDATE OF price ON listings
    FOR EACH ROW EXECUTE FUNCTION check_high_value_listing();

CREATE INDEX idx_listings_vendor ON listings(vendor_id);
CREATE INDEX idx_listings_category ON listings(category_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_price ON listings(price);
CREATE INDEX idx_listings_search ON listings USING GIN(search_text);
CREATE INDEX idx_listings_embedding ON listings USING ivfflat(embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_listings_created ON listings(created_at DESC);

-- Auto-update search_text
CREATE OR REPLACE FUNCTION update_listing_search_text()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_text := to_tsvector('simple', COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.description, ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_listing_search_text
    BEFORE INSERT OR UPDATE OF title, description ON listings
    FOR EACH ROW EXECUTE FUNCTION update_listing_search_text();

-- ============================================================
-- 5. AUCTIONS
-- ============================================================
CREATE TABLE auctions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id      UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    -- config
    starting_price  NUMERIC(12,2) NOT NULL CHECK (starting_price >= 0),
    reserve_price   NUMERIC(12,2),  -- hidden minimum
    min_bid_increment NUMERIC(12,2) DEFAULT 10.00,
    -- timing
    starts_at       TIMESTAMPTZ NOT NULL,
    ends_at         TIMESTAMPTZ NOT NULL,
    auto_extend_seconds INTEGER DEFAULT 30,  -- extend if bid in last N seconds
    -- state
    status          auction_status DEFAULT 'scheduled',
    current_price   NUMERIC(12,2),
    highest_bidder_id UUID REFERENCES users(id),
    bid_count       INTEGER DEFAULT 0,
    -- result
    winner_id       UUID REFERENCES users(id),
    final_price     NUMERIC(12,2),
    -- timestamps
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_auction_dates CHECK (ends_at > starts_at)
);

CREATE INDEX idx_auctions_listing ON auctions(listing_id);
CREATE INDEX idx_auctions_status ON auctions(status);
CREATE INDEX idx_auctions_ends ON auctions(ends_at);

-- ============================================================
-- 6. BIDS
-- ============================================================
CREATE TABLE bids (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auction_id  UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
    bidder_id   UUID NOT NULL REFERENCES users(id),
    amount      NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    is_winning  BOOLEAN DEFAULT FALSE,
    channel     channel_type DEFAULT 'web',
    ip_address  INET,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bids_auction ON bids(auction_id);
CREATE INDEX idx_bids_amount ON bids(auction_id, amount DESC);

-- ============================================================
-- 7. NEGOTIATIONS
-- ============================================================
CREATE TABLE negotiations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id      UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    buyer_id        UUID NOT NULL REFERENCES users(id),
    seller_id       UUID NOT NULL REFERENCES users(id),
    -- offers
    initial_offer   NUMERIC(12,2) NOT NULL,
    current_offer   NUMERIC(12,2) NOT NULL,
    counter_offer   NUMERIC(12,2),
    seller_min_price NUMERIC(12,2),  -- private, set by seller agent
    -- AI strategy
    ai_strategy     JSONB DEFAULT '{}',  -- {strategy_name, confidence, market_range}
    market_price_range JSONB,            -- {min, max, avg}
    -- state
    status          negotiation_status DEFAULT 'open',
    round_count     INTEGER DEFAULT 1,
    max_rounds      INTEGER DEFAULT 5,
    -- result
    agreed_price    NUMERIC(12,2),
    -- timestamps
    expires_at      TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_negotiations_listing ON negotiations(listing_id);
CREATE INDEX idx_negotiations_buyer ON negotiations(buyer_id);
CREATE INDEX idx_negotiations_status ON negotiations(status);

-- ============================================================
-- 8. ORDERS
-- ============================================================
CREATE TABLE orders (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number    VARCHAR(20) UNIQUE NOT NULL,  -- human-readable
    listing_id      UUID NOT NULL REFERENCES listings(id),
    buyer_id        UUID NOT NULL REFERENCES users(id),
    seller_id       UUID NOT NULL REFERENCES users(id),
    vendor_id       UUID NOT NULL REFERENCES vendors(id),
    -- pricing
    item_price      NUMERIC(12,2) NOT NULL,
    platform_fee    NUMERIC(12,2) NOT NULL,
    seller_payout   NUMERIC(12,2) NOT NULL,
    currency        VARCHAR(3) DEFAULT 'TRY',
    -- payment
    payment_method  payment_method DEFAULT 'iyzico_card',
    iyzico_payment_id VARCHAR(255),
    iyzico_payment_transaction_id VARCHAR(255),
    -- escrow
    escrow_status   escrow_status DEFAULT 'holding',
    escrow_released_at TIMESTAMPTZ,
    -- shipping
    shipping_tracking_number VARCHAR(100),
    shipping_carrier VARCHAR(50),
    shipped_at      TIMESTAMPTZ,
    delivered_at    TIMESTAMPTZ,
    -- status
    status          order_status DEFAULT 'created',
    -- source
    source_type     VARCHAR(20) DEFAULT 'direct_buy', -- direct_buy, auction, negotiation
    auction_id      UUID REFERENCES auctions(id),
    negotiation_id  UUID REFERENCES negotiations(id),
    -- timestamps
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Generate human-readable order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number := 'CP-' || TO_CHAR(NOW(), 'YYMMDD') || '-' || 
                        UPPER(SUBSTR(REPLACE(gen_random_uuid()::TEXT, '-', ''), 1, 6));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_number
    BEFORE INSERT ON orders
    FOR EACH ROW EXECUTE FUNCTION generate_order_number();

CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_seller ON orders(seller_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_escrow ON orders(escrow_status);

-- ============================================================
-- 9. PAYMENTS (iyzico transaction log)
-- ============================================================
CREATE TABLE payments (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id            UUID NOT NULL REFERENCES orders(id),
    -- iyzico fields
    iyzico_payment_id   VARCHAR(255),
    iyzico_conversation_id VARCHAR(255) UNIQUE NOT NULL,  -- idempotency key
    iyzico_token        TEXT,
    -- amounts
    paid_price          NUMERIC(12,2) NOT NULL,
    merchant_commission NUMERIC(12,2),
    iyzico_commission   NUMERIC(12,2),
    sub_merchant_payout NUMERIC(12,2),
    -- status
    status              VARCHAR(20) DEFAULT 'pending', -- pending, success, failed, refunded
    fraud_status        VARCHAR(20),  -- from iyzico: 1=approve, -1=reject, 0=pending
    -- card info (tokenized, never store raw)
    card_type           VARCHAR(20),  -- CREDIT_CARD, DEBIT_CARD
    card_association    VARCHAR(20),  -- VISA, MASTER_CARD, TROY
    card_family         VARCHAR(50),
    bin_number          VARCHAR(6),
    last_four           VARCHAR(4),
    -- webhook
    webhook_received_at TIMESTAMPTZ,
    raw_webhook_payload JSONB,
    -- timestamps
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_iyzico ON payments(iyzico_payment_id);
CREATE INDEX idx_payments_conversation ON payments(iyzico_conversation_id);

-- ============================================================
-- 10. AI CONTENT LOG (Watermark tracking)
-- ============================================================
CREATE TABLE ai_content_logs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id      UUID REFERENCES listings(id) ON DELETE SET NULL,
    content_type    VARCHAR(20) NOT NULL,  -- image, text, description
    content_hash    VARCHAR(64) NOT NULL,  -- SHA-256
    watermark_hash  VARCHAR(64),
    ai_model_used   VARCHAR(100),
    prompt_used     TEXT,
    confidence_score NUMERIC(3,2),
    is_disclosed    BOOLEAN DEFAULT TRUE,  -- visible "AI generated" badge
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_content_listing ON ai_content_logs(listing_id);
CREATE INDEX idx_ai_content_hash ON ai_content_logs(content_hash);

-- ============================================================
-- 11. KVKK COMPLIANCE
-- ============================================================
CREATE TABLE consent_logs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    consent_type    consent_type NOT NULL,
    is_granted      BOOLEAN NOT NULL,
    ip_address      INET,
    user_agent      TEXT,
    consent_text_version VARCHAR(10) NOT NULL,  -- e.g. "v1.2"
    granted_at      TIMESTAMPTZ DEFAULT NOW(),
    revoked_at      TIMESTAMPTZ
);

CREATE INDEX idx_consent_user ON consent_logs(user_id);
CREATE INDEX idx_consent_type ON consent_logs(user_id, consent_type);

CREATE TABLE data_deletion_requests (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id),
    status          VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
    reason          TEXT,
    requested_at    TIMESTAMPTZ DEFAULT NOW(),
    processed_at    TIMESTAMPTZ,
    processed_by    UUID REFERENCES users(id),
    deletion_log    JSONB DEFAULT '{}' -- {tables_cleared: [...], records_anonymized: N}
);

-- ============================================================
-- 12. CONTENT TAKEDOWN (5651)
-- ============================================================
CREATE TABLE takedown_requests (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id      UUID REFERENCES listings(id),
    reporter_email  VARCHAR(255),
    reporter_name   VARCHAR(200),
    reason          TEXT NOT NULL,
    legal_basis     VARCHAR(100), -- "5651", "KVKK", "IP_violation", etc.
    status          takedown_status DEFAULT 'pending',
    -- SLA tracking
    received_at     TIMESTAMPTZ DEFAULT NOW(),
    deadline_at     TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '6 hours'), -- 5651: 6-hour SLA
    reviewed_at     TIMESTAMPTZ,
    reviewed_by     UUID REFERENCES users(id),
    action_taken    TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_takedown_listing ON takedown_requests(listing_id);
CREATE INDEX idx_takedown_status ON takedown_requests(status);
CREATE INDEX idx_takedown_deadline ON takedown_requests(deadline_at) WHERE status = 'pending';

-- ============================================================
-- 13. AUDIT LOG (immutable)
-- ============================================================
CREATE TABLE audit_logs (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id    UUID REFERENCES users(id),
    actor_type  VARCHAR(20) DEFAULT 'user', -- user, agent, system
    action      VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    old_value   JSONB,
    new_value   JSONB,
    ip_address  INET,
    user_agent  TEXT,
    channel     channel_type,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Partition by month for performance (2-year retention)
CREATE INDEX idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

-- ============================================================
-- 14. AGENT TASKS (Swarm orchestration tracking)
-- ============================================================
CREATE TABLE agent_tasks (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_type      VARCHAR(50) NOT NULL, -- listing_creator, negotiator, auctioneer, moderator
    task_type       VARCHAR(50) NOT NULL, -- create_listing, negotiate, moderate, etc.
    status          VARCHAR(20) DEFAULT 'queued', -- queued, running, completed, failed, cancelled
    priority        INTEGER DEFAULT 5,    -- 1=highest, 10=lowest
    -- context
    user_id         UUID REFERENCES users(id),
    listing_id      UUID REFERENCES listings(id),
    input_payload   JSONB NOT NULL,
    output_payload  JSONB,
    error_message   TEXT,
    -- timing
    queued_at       TIMESTAMPTZ DEFAULT NOW(),
    started_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    -- sandbox
    container_id    VARCHAR(100),
    wasm_module     VARCHAR(100),  -- IronClaw module name if applicable
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agent_tasks_status ON agent_tasks(status, priority);
CREATE INDEX idx_agent_tasks_type ON agent_tasks(agent_type, task_type);
CREATE INDEX idx_agent_tasks_user ON agent_tasks(user_id);

-- ============================================================
-- 15. FAVORITES
-- ============================================================
CREATE TABLE favorites (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    listing_id  UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_favorite UNIQUE (user_id, listing_id)
);

-- ============================================================
-- 16. MESSAGES (in-app messaging for negotiations)
-- ============================================================
CREATE TABLE messages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    negotiation_id  UUID REFERENCES negotiations(id) ON DELETE CASCADE,
    sender_id       UUID NOT NULL REFERENCES users(id),
    sender_type     VARCHAR(20) DEFAULT 'user', -- user, agent
    content         TEXT NOT NULL,
    is_ai_generated BOOLEAN DEFAULT FALSE,
    channel         channel_type DEFAULT 'web',
    read_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_negotiation ON messages(negotiation_id, created_at);

-- ============================================================
-- updated_at AUTO-TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN SELECT unnest(ARRAY[
        'users', 'vendors', 'listings', 'auctions', 
        'negotiations', 'orders', 'payments', 'agent_tasks'
    ]) LOOP
        EXECUTE format(
            'CREATE TRIGGER trg_%s_updated_at BEFORE UPDATE ON %s FOR EACH ROW EXECUTE FUNCTION update_updated_at()',
            t, t
        );
    END LOOP;
END;
$$;
