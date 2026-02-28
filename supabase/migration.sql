-- ClawPazar — Supabase Migration
-- Tüm tabloları oluşturur + seed data ekler

-- ═══════════════════════════════════════════════
-- 1. CATEGORIES
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name_tr TEXT NOT NULL,
  icon TEXT DEFAULT '📦',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO categories (slug, name_tr, icon) VALUES
  ('elektronik', 'Elektronik', '📱'),
  ('bilgisayar', 'Bilgisayar', '💻'),
  ('gaming', 'Gaming', '🎮'),
  ('moda', 'Moda', '👟'),
  ('kamera', 'Kamera', '📸'),
  ('ev-yasam', 'Ev & Yaşam', '🏠'),
  ('aksesuar', 'Aksesuar', '📦')
ON CONFLICT (slug) DO NOTHING;

-- ═══════════════════════════════════════════════
-- 2. USERS
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  supabase_auth_id TEXT UNIQUE,
  display_name TEXT,
  preferred_channel TEXT DEFAULT 'telegram',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════
-- 3. VENDORS
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS vendors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  store_name TEXT,
  store_slug TEXT UNIQUE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════
-- 4. LISTINGS
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  condition TEXT DEFAULT 'used',
  status TEXT DEFAULT 'active',
  city TEXT,
  images JSONB DEFAULT '[]',
  view_count INT DEFAULT 0,
  source_channel TEXT DEFAULT 'telegram',
  content_source TEXT DEFAULT 'user',
  search_text TSVECTOR,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_listings_search ON listings USING GIN (search_text);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings (status);
CREATE INDEX IF NOT EXISTS idx_listings_created ON listings (created_at DESC);

-- Auto-update search_text trigger
CREATE OR REPLACE FUNCTION listings_search_update() RETURNS TRIGGER AS $$
BEGIN
  NEW.search_text := to_tsvector('simple', coalesce(NEW.title, '') || ' ' || coalesce(NEW.description, '') || ' ' || coalesce(NEW.city, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_listings_search ON listings;
CREATE TRIGGER trg_listings_search
  BEFORE INSERT OR UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION listings_search_update();

-- ═══════════════════════════════════════════════
-- 5. AUCTIONS
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS auctions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  starting_price NUMERIC NOT NULL DEFAULT 0,
  current_price NUMERIC,
  bid_count INT DEFAULT 0,
  status TEXT DEFAULT 'active',
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_auctions_status ON auctions (status);
CREATE INDEX IF NOT EXISTS idx_auctions_ends ON auctions (ends_at ASC);

-- ═══════════════════════════════════════════════
-- 6. RLS (Row Level Security) — Açık bırak service key ile
-- ═══════════════════════════════════════════════
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;

-- Service key ile her şeye erişim
CREATE POLICY IF NOT EXISTS "service_all_categories" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "service_all_users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "service_all_vendors" ON vendors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "service_all_listings" ON listings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "service_all_auctions" ON auctions FOR ALL USING (true) WITH CHECK (true);

-- ═══════════════════════════════════════════════
-- DONE!
-- ═══════════════════════════════════════════════
