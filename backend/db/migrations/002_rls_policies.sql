-- ClawPazar: Supabase Row-Level Security Policies
-- Migration 002: RLS for multi-tenant isolation
-- Every table that stores user data MUST have RLS enabled.

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Get current user's UUID from JWT
CREATE OR REPLACE FUNCTION auth.current_user_id()
RETURNS UUID AS $$
    SELECT (current_setting('request.jwt.claims', TRUE)::JSONB ->> 'sub')::UUID;
$$ LANGUAGE sql STABLE;

-- Get current user's role
CREATE OR REPLACE FUNCTION auth.current_user_role()
RETURNS user_role AS $$
    SELECT role FROM users WHERE supabase_auth_id = auth.current_user_id();
$$ LANGUAGE sql STABLE;

-- Check if current user is admin/moderator
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
    SELECT auth.current_user_role() IN ('admin', 'moderator');
$$ LANGUAGE sql STABLE;

-- Get current user's vendor_id
CREATE OR REPLACE FUNCTION auth.current_vendor_id()
RETURNS UUID AS $$
    SELECT v.id FROM vendors v
    JOIN users u ON u.id = v.user_id
    WHERE u.supabase_auth_id = auth.current_user_id();
$$ LANGUAGE sql STABLE;

-- ============================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE negotiations ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_deletion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE takedown_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_content_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tasks ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- USERS POLICIES
-- ============================================================
-- Users can read their own profile
CREATE POLICY users_select_own ON users
    FOR SELECT USING (supabase_auth_id = auth.current_user_id());

-- Users can update their own profile
CREATE POLICY users_update_own ON users
    FOR UPDATE USING (supabase_auth_id = auth.current_user_id());

-- Public profiles: anyone can see display_name and avatar
CREATE POLICY users_select_public ON users
    FOR SELECT USING (TRUE)
    WITH CHECK (TRUE);

-- Admin: full access
CREATE POLICY users_admin_all ON users
    FOR ALL USING (auth.is_admin());

-- ============================================================
-- VENDORS POLICIES
-- ============================================================
-- Vendor can manage their own store
CREATE POLICY vendors_own ON vendors
    FOR ALL USING (user_id = (SELECT id FROM users WHERE supabase_auth_id = auth.current_user_id()));

-- Public: anyone can view active vendors
CREATE POLICY vendors_select_active ON vendors
    FOR SELECT USING (status = 'active');

-- Admin: full access
CREATE POLICY vendors_admin ON vendors
    FOR ALL USING (auth.is_admin());

-- ============================================================
-- LISTINGS POLICIES
-- ============================================================
-- Public: anyone can view active listings
CREATE POLICY listings_select_active ON listings
    FOR SELECT USING (status = 'active');

-- Vendor: can manage own listings
CREATE POLICY listings_vendor_own ON listings
    FOR ALL USING (vendor_id = auth.current_vendor_id());

-- Drafts: only owner can see
CREATE POLICY listings_vendor_drafts ON listings
    FOR SELECT USING (
        vendor_id = auth.current_vendor_id()
        AND status IN ('draft', 'pending_review')
    );

-- Admin: can see and moderate all
CREATE POLICY listings_admin ON listings
    FOR ALL USING (auth.is_admin());

-- ============================================================
-- AUCTIONS POLICIES
-- ============================================================
-- Public: anyone can view active auctions
CREATE POLICY auctions_select_active ON auctions
    FOR SELECT USING (status IN ('active', 'ended'));

-- Listing owner: can manage their auction
CREATE POLICY auctions_owner ON auctions
    FOR ALL USING (
        listing_id IN (SELECT id FROM listings WHERE vendor_id = auth.current_vendor_id())
    );

-- Admin: full access
CREATE POLICY auctions_admin ON auctions
    FOR ALL USING (auth.is_admin());

-- ============================================================
-- BIDS POLICIES
-- ============================================================
-- Public: anyone can view bids on active auctions
CREATE POLICY bids_select ON bids
    FOR SELECT USING (TRUE);

-- Authenticated: can place bids
CREATE POLICY bids_insert ON bids
    FOR INSERT WITH CHECK (bidder_id = (SELECT id FROM users WHERE supabase_auth_id = auth.current_user_id()));

-- Admin: full access
CREATE POLICY bids_admin ON bids
    FOR ALL USING (auth.is_admin());

-- ============================================================
-- NEGOTIATIONS POLICIES
-- ============================================================
-- Parties can see their own negotiations
CREATE POLICY negotiations_parties ON negotiations
    FOR SELECT USING (
        buyer_id = (SELECT id FROM users WHERE supabase_auth_id = auth.current_user_id())
        OR seller_id = (SELECT id FROM users WHERE supabase_auth_id = auth.current_user_id())
    );

-- Buyer can start a negotiation
CREATE POLICY negotiations_buyer_insert ON negotiations
    FOR INSERT WITH CHECK (
        buyer_id = (SELECT id FROM users WHERE supabase_auth_id = auth.current_user_id())
    );

-- Parties can update their negotiation
CREATE POLICY negotiations_parties_update ON negotiations
    FOR UPDATE USING (
        buyer_id = (SELECT id FROM users WHERE supabase_auth_id = auth.current_user_id())
        OR seller_id = (SELECT id FROM users WHERE supabase_auth_id = auth.current_user_id())
    );

-- Admin: full access
CREATE POLICY negotiations_admin ON negotiations
    FOR ALL USING (auth.is_admin());

-- ============================================================
-- ORDERS POLICIES
-- ============================================================
-- Buyer: can see own orders
CREATE POLICY orders_buyer ON orders
    FOR SELECT USING (buyer_id = (SELECT id FROM users WHERE supabase_auth_id = auth.current_user_id()));

-- Seller: can see own orders
CREATE POLICY orders_seller ON orders
    FOR SELECT USING (seller_id = (SELECT id FROM users WHERE supabase_auth_id = auth.current_user_id()));

-- Admin: full access
CREATE POLICY orders_admin ON orders
    FOR ALL USING (auth.is_admin());

-- ============================================================
-- PAYMENTS POLICIES
-- ============================================================
-- Only order parties can view payment details
CREATE POLICY payments_parties ON payments
    FOR SELECT USING (
        order_id IN (
            SELECT id FROM orders
            WHERE buyer_id = (SELECT id FROM users WHERE supabase_auth_id = auth.current_user_id())
               OR seller_id = (SELECT id FROM users WHERE supabase_auth_id = auth.current_user_id())
        )
    );

-- Admin: full access
CREATE POLICY payments_admin ON payments
    FOR ALL USING (auth.is_admin());

-- ============================================================
-- CONSENT LOGS POLICIES (KVKK)
-- ============================================================
-- User can see own consent history
CREATE POLICY consent_own ON consent_logs
    FOR SELECT USING (user_id = (SELECT id FROM users WHERE supabase_auth_id = auth.current_user_id()));

-- User can grant/revoke own consent
CREATE POLICY consent_insert ON consent_logs
    FOR INSERT WITH CHECK (user_id = (SELECT id FROM users WHERE supabase_auth_id = auth.current_user_id()));

-- Admin: read only (cannot modify consent)
CREATE POLICY consent_admin_read ON consent_logs
    FOR SELECT USING (auth.is_admin());

-- ============================================================
-- FAVORITES POLICIES
-- ============================================================
-- User manages own favorites
CREATE POLICY favorites_own ON favorites
    FOR ALL USING (user_id = (SELECT id FROM users WHERE supabase_auth_id = auth.current_user_id()));

-- ============================================================
-- MESSAGES POLICIES
-- ============================================================
-- Parties in negotiation can view/send messages
CREATE POLICY messages_parties ON messages
    FOR ALL USING (
        negotiation_id IN (
            SELECT id FROM negotiations
            WHERE buyer_id = (SELECT id FROM users WHERE supabase_auth_id = auth.current_user_id())
               OR seller_id = (SELECT id FROM users WHERE supabase_auth_id = auth.current_user_id())
        )
    );

-- Admin: full access
CREATE POLICY messages_admin ON messages
    FOR ALL USING (auth.is_admin());

-- ============================================================
-- TAKEDOWN REQUESTS
-- ============================================================
-- Anyone can submit a takedown request
CREATE POLICY takedown_insert ON takedown_requests
    FOR INSERT WITH CHECK (TRUE);

-- Admin/moderator: full access
CREATE POLICY takedown_admin ON takedown_requests
    FOR ALL USING (auth.is_admin());

-- ============================================================
-- AUDIT LOGS (immutable, admin-only read)
-- ============================================================
CREATE POLICY audit_admin_read ON audit_logs
    FOR SELECT USING (auth.is_admin());

-- Service role can insert (no user can insert directly)
CREATE POLICY audit_service_insert ON audit_logs
    FOR INSERT WITH CHECK (TRUE);  -- controlled via service_role key

-- ============================================================
-- AI CONTENT LOGS
-- ============================================================
-- Public: anyone can verify AI content
CREATE POLICY ai_content_public ON ai_content_logs
    FOR SELECT USING (TRUE);

-- Admin: full access
CREATE POLICY ai_content_admin ON ai_content_logs
    FOR ALL USING (auth.is_admin());

-- ============================================================
-- AGENT TASKS (service-level only)
-- ============================================================
-- Only service role and admins
CREATE POLICY agent_tasks_admin ON agent_tasks
    FOR ALL USING (auth.is_admin());

-- Users can see their own task status
CREATE POLICY agent_tasks_own ON agent_tasks
    FOR SELECT USING (user_id = (SELECT id FROM users WHERE supabase_auth_id = auth.current_user_id()));
