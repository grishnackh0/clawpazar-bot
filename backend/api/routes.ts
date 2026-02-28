// ClawPazar – API Routes (Express.js)
// REST + WebSocket endpoints for the marketplace
// Integrates: MercurJS, SwarmManager, IyzicoService, KVKKService, WatermarkService

import express, { Request, Response, NextFunction, Router } from 'express';
import { createServer } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SwarmManager, createSwarmManager } from '../agents/swarm-manager';
import { IyzicoService, createIyzicoService } from '../services/iyzico.service';
import { KVKKService, createKVKKService } from '../services/kvkk.service';
import { WatermarkService, createWatermarkService } from '../services/watermark.service';
import { IronClawBridge, createIronClawBridge } from '../agents/ironclaw-bridge';
import { ShippingService, createShippingService } from '../services/shipping.service';

// ============================================================
// APP SETUP
// ============================================================

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

// ============================================================
// SERVICE INITIALIZATION
// ============================================================

const supabase: SupabaseClient = createClient(
    process.env.SUPABASE_URL || 'http://localhost:54321',
    process.env.SUPABASE_SERVICE_KEY || '',
);

const swarm = createSwarmManager();
const iyzico = createIyzicoService();
const kvkk = createKVKKService(supabase);
const watermark = createWatermarkService();
const ironClaw = createIronClawBridge();
const shipping = createShippingService();

// ============================================================
// AUTH MIDDLEWARE
// ============================================================

interface AuthRequest extends Request {
    userId?: string;
    userRole?: string;
}

// In-memory OTP store for demo mode (production: SMS via Twilio/Netgsm)
const otpStore = new Map<string, { code: string; expiresAt: number }>();
// In-memory user store for demo mode (production: Supabase)
const demoUsers = new Map<string, { id: string; phone: string; displayName: string; role: string }>();

async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }

    // Demo token support: tokens starting with 'demo-' bypass Supabase
    if (token.startsWith('demo-')) {
        const phone = token.replace('demo-', '');
        const user = demoUsers.get(phone);
        if (user) {
            req.userId = user.id;
            req.userRole = user.role;
            return next();
        }
        // Create demo user on first auth
        const newUser = {
            id: `demo-${phone}`,
            phone,
            displayName: `Kullanıcı ${phone.slice(-4)}`,
            role: 'seller',
        };
        demoUsers.set(phone, newUser);
        req.userId = newUser.id;
        req.userRole = newUser.role;
        return next();
    }

    // Production: Supabase auth
    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) {
            res.status(401).json({ error: 'Invalid token' });
            return;
        }
        const { data: cpUser } = await supabase
            .from('users')
            .select('id, role')
            .eq('supabase_auth_id', user.id)
            .single();
        req.userId = cpUser?.id;
        req.userRole = cpUser?.role;
        next();
    } catch {
        // Supabase not available — accept demo mode
        req.userId = 'demo-fallback';
        req.userRole = 'seller';
        next();
    }
}

function adminOnly(req: AuthRequest, res: Response, next: NextFunction): void {
    if (req.userRole !== 'admin' && req.userRole !== 'moderator') {
        res.status(403).json({ error: 'Admin access required' });
        return;
    }
    next();
}

// ============================================================
// HEALTH CHECK
// ============================================================

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: process.env.APP_VERSION || '0.1.0',
        services: {
            swarm: swarm.getStatus(),
            ironClaw: ironClaw.getStatus(),
        },
    });
});

// ============================================================
// AUTH ROUTES (Mock OTP for demo, Supabase GoTrue for production)
// ============================================================

// Send OTP — demo mode: always succeeds, code = 123456
app.post('/api/auth/send-otp', (req: Request, res: Response) => {
    const { phone } = req.body;
    if (!phone || phone.length < 10) {
        return res.status(400).json({ error: 'Geçerli telefon numarası gerekli' });
    }
    const code = '123456'; // Demo mode — production: random 6-digit + SMS send
    otpStore.set(phone, { code, expiresAt: Date.now() + 300_000 }); // 5 min TTL
    console.log(`[Auth] OTP sent to ${phone}: ${code} (demo mode)`);
    res.json({ success: true, message: 'Doğrulama kodu gönderildi', demo: true });
});

// Verify OTP — returns JWT token
app.post('/api/auth/verify-otp', (req: Request, res: Response) => {
    const { phone, code } = req.body;
    if (!phone || !code) {
        return res.status(400).json({ error: 'Telefon ve kod gerekli' });
    }

    const stored = otpStore.get(phone);
    if (!stored || stored.code !== code || Date.now() > stored.expiresAt) {
        return res.status(401).json({ error: 'Geçersiz veya süresi dolmuş kod' });
    }

    otpStore.delete(phone); // One-time use

    // Create or get demo user
    if (!demoUsers.has(phone)) {
        demoUsers.set(phone, {
            id: `demo-${Date.now()}`,
            phone,
            displayName: `Kullanıcı ${phone.slice(-4)}`,
            role: 'seller',
        });
    }

    const user = demoUsers.get(phone)!;
    const token = `demo-${phone}`; // Demo token — production: JWT via GoTrue

    res.json({
        token,
        user: {
            id: user.id,
            phone: user.phone,
            displayName: user.displayName,
            role: user.role,
        },
    });
});

// Get current user profile
app.get('/api/auth/me', authMiddleware, (req: AuthRequest, res: Response) => {
    const userId = req.userId || 'unknown';
    // Try to find in demo users
    for (const [, user] of demoUsers) {
        if (user.id === userId) {
            return res.json({ user });
        }
    }
    res.json({
        user: { id: userId, displayName: 'Kullanıcı', role: req.userRole || 'seller' },
    });
});

// ============================================================
// 1. LISTINGS API
// ============================================================

const listingsRouter = Router();

// GET /api/listings — Browse active listings
listingsRouter.get('/', async (req: Request, res: Response) => {
    const { page = 1, limit = 20, category, search, minPrice, maxPrice, city, sort } = req.query;

    let query = supabase
        .from('listings')
        .select('*, vendors(store_name, avg_rating), categories(name_tr, slug)')
        .eq('status', 'active')
        .range(
            (Number(page) - 1) * Number(limit),
            Number(page) * Number(limit) - 1
        );

    if (category) query = query.eq('categories.slug', category);
    if (minPrice) query = query.gte('price', Number(minPrice));
    if (maxPrice) query = query.lte('price', Number(maxPrice));
    if (city) query = query.eq('city', city);
    if (search) query = query.textSearch('search_text', String(search));

    if (sort === 'price_asc') query = query.order('price', { ascending: true });
    else if (sort === 'price_desc') query = query.order('price', { ascending: false });
    else query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;
    if (error) return res.status(500).json({ error: error.message });

    res.json({ listings: data, total: count, page: Number(page), limit: Number(limit) });
});

// GET /api/listings/:id — Listing detail
listingsRouter.get('/:id', async (req: Request, res: Response) => {
    const { data, error } = await supabase
        .from('listings')
        .select('*, vendors(store_name, avg_rating, store_slug), categories(name_tr, slug), ai_content_logs(*)')
        .eq('id', req.params.id)
        .single();

    if (error) return res.status(404).json({ error: 'Listing not found' });

    // Increment view count
    await supabase.rpc('increment_view_count', { listing_id: req.params.id });

    res.json(data);
});

// POST /api/listings — Create listing (via agent)
listingsRouter.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    const { message, images, channel = 'web' } = req.body;

    // Submit to listing creator agent
    const taskId = swarm.submitTask({
        agentType: 'listing_creator',
        taskType: 'create_listing',
        priority: 3,
        userId: req.userId!,
        inputPayload: { message, images, channel, isVoice: false },
    });

    res.status(202).json({ taskId, status: 'processing', message: 'İlan oluşturuluyor...' });
});

// PUT /api/listings/:id — Update listing
listingsRouter.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    const { data, error } = await supabase
        .from('listings')
        .update(req.body)
        .eq('id', req.params.id)
        .select()
        .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

// POST /api/listings/:id/publish — Publish draft
listingsRouter.post('/:id/publish', authMiddleware, async (req: AuthRequest, res: Response) => {
    // Content moderation check via IronClaw
    const listing = await supabase.from('listings').select('*').eq('id', req.params.id).single();
    if (!listing.data) return res.status(404).json({ error: 'Listing not found' });

    const modResult = await ironClaw.moderateContent({
        text: `${listing.data.title} ${listing.data.description}`,
        category: listing.data.category_id || '',
    });

    if (!modResult.success || !modResult.result?.approved) {
        return res.status(400).json({
            error: 'Content moderation failed',
            flags: modResult.result?.flags,
        });
    }

    // Apply AI watermark if content is AI-generated
    if (listing.data.content_source !== 'user') {
        const wm = watermark.watermarkText({
            text: listing.data.description,
            aiModel: 'clawpazar-listing-v1',
            listingId: req.params.id,
            contentType: 'description',
        });

        // Log watermark
        await supabase.from('ai_content_logs').insert({
            listing_id: req.params.id,
            content_type: 'description',
            content_hash: wm.result.contentHash,
            watermark_hash: wm.result.watermarkHash,
            ai_model_used: 'clawpazar-listing-v1',
            is_disclosed: true,
        });
    }

    // Publish
    const status = listing.data.requires_human_review ? 'pending_review' : 'active';
    const { data, error } = await supabase
        .from('listings')
        .update({ status, published_at: new Date().toISOString() })
        .eq('id', req.params.id)
        .select()
        .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

// DELETE /api/listings/:id
listingsRouter.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
    const { error } = await supabase
        .from('listings')
        .update({ status: 'removed' })
        .eq('id', req.params.id);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
});

// POST /api/listings/search/semantic — pgvector semantic search
listingsRouter.post('/search/semantic', async (req: Request, res: Response) => {
    const { embedding, limit = 10, threshold = 0.7 } = req.body;

    const { data, error } = await supabase.rpc('search_listings_by_embedding', {
        query_embedding: embedding,
        match_threshold: threshold,
        match_count: limit,
    });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

app.use('/api/listings', listingsRouter);

// ============================================================
// 2. AUCTIONS API
// ============================================================

const auctionsRouter = Router();

// GET /api/auctions — Active auctions
auctionsRouter.get('/', async (req: Request, res: Response) => {
    const { data, error } = await supabase
        .from('auctions')
        .select('*, listings(title, thumbnail_url, price)')
        .in('status', ['active', 'scheduled'])
        .order('ends_at', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// POST /api/auctions — Create auction
auctionsRouter.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    const { listingId, startingPrice, reservePrice, durationMinutes, minBidIncrement } = req.body;

    const startsAt = new Date();
    const endsAt = new Date(startsAt.getTime() + durationMinutes * 60 * 1000);

    const { data, error } = await supabase
        .from('auctions')
        .insert({
            listing_id: listingId,
            starting_price: startingPrice,
            reserve_price: reservePrice,
            min_bid_increment: minBidIncrement || 10,
            starts_at: startsAt.toISOString(),
            ends_at: endsAt.toISOString(),
            status: 'active',
            current_price: startingPrice,
        })
        .select()
        .single();

    if (error) return res.status(400).json({ error: error.message });

    // Notify auctioneer agent
    swarm.submitTask({
        agentType: 'auctioneer',
        taskType: 'start_auction',
        priority: 2,
        userId: req.userId!,
        listingId,
        inputPayload: { action: 'start', auctionId: data.id },
    });

    res.status(201).json(data);
});

// POST /api/auctions/:id/bid — Place bid
auctionsRouter.post('/:id/bid', authMiddleware, async (req: AuthRequest, res: Response) => {
    const { amount } = req.body;
    const auctionId = req.params.id;

    // Get current auction state
    const { data: auction } = await supabase
        .from('auctions')
        .select('*')
        .eq('id', auctionId)
        .single();

    if (!auction || auction.status !== 'active') {
        return res.status(400).json({ error: 'Auction is not active' });
    }

    // Validate bid
    const minBid = (auction.current_price || auction.starting_price) + auction.min_bid_increment;
    if (amount < minBid) {
        return res.status(400).json({ error: `Minimum bid is ${minBid} TL` });
    }

    // Check if auction needs extending (anti-sniping)
    const endsAt = new Date(auction.ends_at);
    const now = new Date();
    const secondsRemaining = (endsAt.getTime() - now.getTime()) / 1000;

    let newEndsAt = auction.ends_at;
    if (secondsRemaining < auction.auto_extend_seconds) {
        newEndsAt = new Date(now.getTime() + auction.auto_extend_seconds * 1000).toISOString();
    }

    // Record bid
    const { data: bid, error: bidError } = await supabase
        .from('bids')
        .insert({
            auction_id: auctionId,
            bidder_id: req.userId,
            amount,
            is_winning: true,
            channel: 'web',
            ip_address: req.ip,
        })
        .select()
        .single();

    if (bidError) return res.status(400).json({ error: bidError.message });

    // Update auction state
    await supabase
        .from('auctions')
        .update({
            current_price: amount,
            highest_bidder_id: req.userId,
            bid_count: auction.bid_count + 1,
            ends_at: newEndsAt,
        })
        .eq('id', auctionId);

    // Mark previous winning bid as not winning
    await supabase
        .from('bids')
        .update({ is_winning: false })
        .eq('auction_id', auctionId)
        .eq('is_winning', true)
        .neq('id', bid.id);

    // Broadcast to WebSocket clients
    broadcastAuction(auctionId, {
        type: 'new_bid',
        bid: { id: bid.id, amount, bidderId: req.userId },
        currentPrice: amount,
        endsAt: newEndsAt,
    });

    res.json(bid);
});

app.use('/api/auctions', auctionsRouter);

// ============================================================
// 3. NEGOTIATIONS API
// ============================================================

const negotiationsRouter = Router();

// POST /api/negotiations — Start negotiation
negotiationsRouter.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    const { listingId, offerAmount } = req.body;

    // Get listing details
    const { data: listing } = await supabase
        .from('listings')
        .select('*, vendors(user_id)')
        .eq('id', listingId)
        .single();

    if (!listing) return res.status(404).json({ error: 'Listing not found' });

    // Create negotiation
    const { data, error } = await supabase
        .from('negotiations')
        .insert({
            listing_id: listingId,
            buyer_id: req.userId,
            seller_id: listing.vendors.user_id,
            initial_offer: offerAmount,
            current_offer: offerAmount,
        })
        .select()
        .single();

    if (error) return res.status(400).json({ error: error.message });

    // Submit to negotiation agent
    swarm.submitTask({
        agentType: 'negotiator',
        taskType: 'evaluate_offer',
        priority: 3,
        userId: req.userId!,
        listingId,
        inputPayload: {
            negotiationId: data.id,
            offerAmount,
            listingPrice: listing.price,
            sellerMinPrice: listing.price * 0.8, // default: 80% of asking price
            round: 1,
        },
    });

    res.status(201).json(data);
});

// POST /api/negotiations/:id/counter — Counter offer
negotiationsRouter.post('/:id/counter', authMiddleware, async (req: AuthRequest, res: Response) => {
    const { amount } = req.body;

    const { data, error } = await supabase
        .from('negotiations')
        .update({
            counter_offer: amount,
            status: 'counter_offered',
            round_count: supabase.rpc ? undefined : 1, // increment handled by agent
        })
        .eq('id', req.params.id)
        .select()
        .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

// POST /api/negotiations/:id/accept
negotiationsRouter.post('/:id/accept', authMiddleware, async (req: AuthRequest, res: Response) => {
    const { data: negotiation } = await supabase
        .from('negotiations')
        .select('*')
        .eq('id', req.params.id)
        .single();

    if (!negotiation) return res.status(404).json({ error: 'Negotiation not found' });

    const agreedPrice = negotiation.counter_offer || negotiation.current_offer;

    const { data, error } = await supabase
        .from('negotiations')
        .update({ status: 'accepted', agreed_price: agreedPrice })
        .eq('id', req.params.id)
        .select()
        .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

app.use('/api/negotiations', negotiationsRouter);

// ============================================================
// 4. PAYMENTS API (iyzico)
// ============================================================

const paymentsRouter = Router();

// POST /api/payments/initialize — Start 3DS payment
paymentsRouter.post('/initialize', authMiddleware, async (req: AuthRequest, res: Response) => {
    const { orderId, card, buyer, shippingAddress, billingAddress } = req.body;

    // Get order details
    const { data: order } = await supabase
        .from('orders')
        .select('*, listings(title, category_id)')
        .eq('id', orderId)
        .single();

    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Get vendor's sub-merchant key
    const { data: vendor } = await supabase
        .from('vendors')
        .select('iyzico_sub_merchant_key, commission_rate')
        .eq('id', order.vendor_id)
        .single();

    if (!vendor?.iyzico_sub_merchant_key) {
        return res.status(400).json({ error: 'Vendor payment setup incomplete' });
    }

    const commission = IyzicoService.calculateCommission(
        order.item_price,
        vendor.commission_rate
    );

    const result = await iyzico.initializeThreeDSPayment({
        conversationId: `cp-${order.id}-${Date.now()}`,
        price: order.item_price.toString(),
        paidPrice: order.item_price.toString(),
        currency: 'TRY',
        installment: 1,
        paymentChannel: 'WEB',
        paymentGroup: 'PRODUCT', // ESCROW
        paymentCard: card,
        buyer,
        shippingAddress,
        billingAddress,
        basketItems: [{
            id: order.listing_id,
            name: order.listings.title,
            category1: 'Marketplace',
            itemType: 'PHYSICAL',
            price: order.item_price.toString(),
            subMerchantKey: vendor.iyzico_sub_merchant_key,
            subMerchantPrice: commission.sellerPayout.toString(),
        }],
        callbackUrl: `${process.env.API_URL}/api/payments/callback`,
    });

    res.json(result);
});

// POST /api/payments/callback — iyzico 3DS callback
paymentsRouter.post('/callback', async (req: Request, res: Response) => {
    const { paymentId } = req.body;

    const result = await iyzico.completeThreeDSPayment(paymentId);

    if (result.status === 'success') {
        // Record payment
        await supabase.from('payments').insert({
            order_id: req.body.orderId,
            iyzico_payment_id: result.paymentId,
            iyzico_conversation_id: req.body.conversationId,
            paid_price: result.paidPrice,
            status: 'success',
            fraud_status: result.fraudStatus.toString(),
        });

        // Update order status
        await supabase
            .from('orders')
            .update({ status: 'payment_completed', iyzico_payment_id: result.paymentId })
            .eq('id', req.body.orderId);
    }

    // Redirect to frontend
    res.redirect(`${process.env.FRONTEND_URL}/order/${req.body.orderId}?payment=${result.status}`);
});

// POST /api/payments/webhook — iyzico webhook
paymentsRouter.post('/webhook', async (req: Request, res: Response) => {
    const signature = req.headers['x-iyzico-signature'] as string;
    const processedIds = new Set<string>(); // TODO: use Redis in production

    try {
        const result = await iyzico.processWebhook(
            req.body,
            JSON.stringify(req.body),
            signature,
            processedIds
        );

        // Update payment and order based on webhook action
        if (result.action === 'payment_authorized') {
            const { data: payment } = await supabase
                .from('payments')
                .select('order_id')
                .eq('iyzico_conversation_id', result.conversationId)
                .single();

            if (payment) {
                await supabase
                    .from('orders')
                    .update({ status: 'payment_completed' })
                    .eq('id', payment.order_id);
            }
        }

        res.json({ received: true });
    } catch (err) {
        console.error('Webhook error:', err);
        res.status(400).json({ error: 'Invalid webhook' });
    }
});

// POST /api/payments/:orderId/release — Release escrow
paymentsRouter.post('/:orderId/release', authMiddleware, adminOnly, async (req: AuthRequest, res: Response) => {
    const { data: payment } = await supabase
        .from('payments')
        .select('*')
        .eq('order_id', req.params.orderId)
        .single();

    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    // Release escrow via iyzico
    const result = await iyzico.approveEscrow(payment.iyzico_payment_id);

    // Update order
    await supabase
        .from('orders')
        .update({
            escrow_status: 'released',
            escrow_released_at: new Date().toISOString(),
            status: 'completed',
        })
        .eq('id', req.params.orderId);

    res.json(result);
});

app.use('/api/payments', paymentsRouter);

// ============================================================
// 5. VENDORS API
// ============================================================

const vendorsRouter = Router();

// POST /api/vendors/register — Register as seller
vendorsRouter.post('/register', authMiddleware, async (req: AuthRequest, res: Response) => {
    const { storeName, address, city, district, identityNumber, iban, subMerchantType } = req.body;

    // Create vendor record
    const storeSlug = storeName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const { data: vendor, error } = await supabase
        .from('vendors')
        .insert({
            user_id: req.userId,
            store_name: storeName,
            store_slug: `${storeSlug}-${Date.now().toString(36)}`,
            address,
            city,
            district,
            identity_number: identityNumber,
            iban,
            iyzico_sub_merchant_type: subMerchantType || 'PERSONAL',
        })
        .select()
        .single();

    if (error) return res.status(400).json({ error: error.message });

    // Register with iyzico
    const { data: user } = await supabase
        .from('users')
        .select('email, phone, display_name')
        .eq('id', req.userId)
        .single();

    const iyzicoResult = await iyzico.createSubMerchant({
        conversationId: `vendor-${vendor.id}`,
        subMerchantExternalId: vendor.id,
        subMerchantType: subMerchantType || 'PERSONAL',
        address,
        email: user?.email || '',
        gsmNumber: user?.phone || '',
        name: storeName,
        iban,
        currency: 'TRY',
        identityNumber,
    });

    if (iyzicoResult.status === 'success') {
        await supabase
            .from('vendors')
            .update({ iyzico_sub_merchant_key: iyzicoResult.subMerchantKey })
            .eq('id', vendor.id);
    }

    // Update user role to seller
    await supabase.from('users').update({ role: 'seller' }).eq('id', req.userId);

    res.status(201).json({ vendor, iyzicoStatus: iyzicoResult.status });
});

app.use('/api/vendors', vendorsRouter);

// ============================================================
// 6. KVKK & COMPLIANCE API
// ============================================================

const complianceRouter = Router();

// GET /api/compliance/disclosure — Get disclosure text
complianceRouter.get('/disclosure', (req: Request, res: Response) => {
    res.json(KVKKService.getDisclosureText());
});

// POST /api/compliance/consent — Record consent
complianceRouter.post('/consent', authMiddleware, async (req: AuthRequest, res: Response) => {
    const { consentType, isGranted, consentTextVersion } = req.body;

    const result = await kvkk.recordConsent({
        userId: req.userId!,
        consentType,
        isGranted,
        ipAddress: req.ip || '0.0.0.0',
        userAgent: req.headers['user-agent'] || '',
        consentTextVersion,
    });

    res.json(result);
});

// GET /api/compliance/consents — User's consent status
complianceRouter.get('/consents', authMiddleware, async (req: AuthRequest, res: Response) => {
    const consents = await kvkk.getUserConsents(req.userId!);
    res.json(consents);
});

// POST /api/compliance/delete — Request data deletion
complianceRouter.post('/delete', authMiddleware, async (req: AuthRequest, res: Response) => {
    const result = await kvkk.requestDeletion({
        userId: req.userId!,
        reason: req.body.reason || 'User requested deletion',
    });
    res.json(result);
});

// GET /api/compliance/export — Export user data
complianceRouter.get('/export', authMiddleware, async (req: AuthRequest, res: Response) => {
    const data = await kvkk.exportUserData(req.userId!);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="clawpazar-data-export-${req.userId}.json"`);
    res.json(data);
});

// POST /api/compliance/takedown — Report content (5651)
complianceRouter.post('/takedown', async (req: Request, res: Response) => {
    const { listingId, reporterEmail, reporterName, reason, legalBasis } = req.body;

    const { data, error } = await supabase
        .from('takedown_requests')
        .insert({
            listing_id: listingId,
            reporter_email: reporterEmail,
            reporter_name: reporterName,
            reason,
            legal_basis: legalBasis || '5651',
        })
        .select()
        .single();

    if (error) return res.status(400).json({ error: error.message });

    // Notify moderators via agent
    swarm.submitTask({
        agentType: 'notification',
        taskType: 'send_notification',
        priority: 1, // highest priority
        userId: 'system',
        inputPayload: {
            channel: 'email',
            recipientId: 'admin-group',
            template: 'takedown_request',
            data: { listingId, reason, deadline: data.deadline_at },
        },
    });

    res.status(201).json({
        requestId: data.id,
        message: 'Şikayetiniz alınmıştır. 6 saat içinde değerlendirilecektir.',
        deadline: data.deadline_at,
    });
});

app.use('/api/compliance', complianceRouter);

// ============================================================
// 7. AGENT STATUS API
// ============================================================

const agentRouter = Router();

// GET /api/agents/status — Swarm status
agentRouter.get('/status', authMiddleware, adminOnly, (req: Request, res: Response) => {
    res.json(swarm.getStatus());
});

// GET /api/agents/tasks/:id — Task status
agentRouter.get('/tasks/:id', authMiddleware, (req: AuthRequest, res: Response) => {
    const task = swarm.getTaskStatus(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
});

app.use('/api/agents', agentRouter);

// ============================================================
// 8. WEBHOOK ENDPOINTS (WhatsApp, Telegram)
// ============================================================

import { messagingService } from '../services/messaging.service';

const webhookRouter = Router();

// POST /api/webhooks/whatsapp — WhatsApp Business API webhook
webhookRouter.post('/whatsapp', async (req: Request, res: Response) => {
    // Respond immediately (WhatsApp requires 200 within 5s)
    res.sendStatus(200);

    // Process asynchronously
    try {
        await messagingService.handleWhatsApp(req.body);
    } catch (err) {
        console.error('[Webhook] WhatsApp processing error:', err);
    }
});

// GET /api/webhooks/whatsapp — Verification
webhookRouter.get('/whatsapp', (req: Request, res: Response) => {
    const challenge = req.query['hub.challenge'];
    const verifyToken = req.query['hub.verify_token'];
    if (verifyToken === process.env.WHATSAPP_VERIFY_TOKEN) {
        res.send(challenge);
    } else {
        res.sendStatus(403);
    }
});

// POST /api/webhooks/telegram — Telegram Bot webhook
webhookRouter.post('/telegram', async (req: Request, res: Response) => {
    // Respond immediately (Telegram retries if no 200 within 60s)
    res.sendStatus(200);

    // Process asynchronously
    try {
        await messagingService.handleTelegram(req.body);
    } catch (err) {
        console.error('[Webhook] Telegram processing error:', err);
    }
});

app.use('/api/webhooks', webhookRouter);

// ============================================================
// 9. WEBSOCKET: Real-time Auction & Negotiation Updates
// ============================================================

// Track auction rooms
const auctionRooms: Map<string, Set<WebSocket>> = new Map();

wss.on('connection', (ws: WebSocket, req) => {
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const auctionId = url.searchParams.get('auctionId');
    const userId = url.searchParams.get('userId');

    if (auctionId) {
        // Join auction room
        if (!auctionRooms.has(auctionId)) {
            auctionRooms.set(auctionId, new Set());
        }
        auctionRooms.get(auctionId)!.add(ws);

        ws.send(JSON.stringify({ type: 'joined', auctionId }));
    }

    ws.on('message', async (data) => {
        try {
            const msg = JSON.parse(data.toString());

            switch (msg.type) {
                case 'ping':
                    ws.send(JSON.stringify({ type: 'pong' }));
                    break;

                case 'subscribe_negotiation':
                    // Track negotiation subscriptions
                    ws.send(JSON.stringify({ type: 'subscribed', negotiationId: msg.negotiationId }));
                    break;
            }
        } catch {
            // ignore malformed messages
        }
    });

    ws.on('close', () => {
        // Remove from all rooms
        for (const [, clients] of auctionRooms) {
            clients.delete(ws);
        }
    });
});

function broadcastAuction(auctionId: string, data: object): void {
    const clients = auctionRooms.get(auctionId);
    if (!clients) return;

    const message = JSON.stringify(data);
    for (const client of clients) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    }
}

// ============================================================
// SHIPPING ROUTES
// ============================================================

// List active carriers
app.get('/api/shipping/carriers', (req: Request, res: Response) => {
    res.json({ carriers: shipping.getCarriers() });
});

// Get shipping rates (price comparison across all carriers)
app.post('/api/shipping/rates', async (req: Request, res: Response) => {
    try {
        const { from, to, parcel } = req.body;
        if (!from?.city || !to?.city || !parcel?.weightKg) {
            return res.status(400).json({ error: 'from, to, parcel gerekli' });
        }
        const rates = await shipping.getRates(from, to, parcel);
        res.json({ rates });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Create shipment (label + tracking number)
app.post('/api/shipping/create', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { orderId, carrierId, from, to, parcel } = req.body;
        if (!orderId || !carrierId || !from || !to || !parcel) {
            return res.status(400).json({ error: 'orderId, carrierId, from, to, parcel gerekli' });
        }
        const shipment = await shipping.createShipment(orderId, carrierId, from, to, parcel);
        res.status(201).json({ shipment });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Get tracking info
app.get('/api/shipping/:id/tracking', async (req: Request, res: Response) => {
    try {
        const tracking = await shipping.getTracking(req.params.id);
        res.json({ tracking });
    } catch (err: any) {
        res.status(404).json({ error: err.message });
    }
});

// Confirm delivery → triggers iyzico escrow release
app.post('/api/shipping/:id/confirm', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const result = await shipping.confirmDelivery(req.params.id);

        // Auto-release escrow when delivery confirmed
        if (result.shouldReleaseEscrow) {
            try {
                await iyzico.approveEscrow(result.orderId);
                console.log(`[Shipping] Escrow released for order ${result.orderId}`);
            } catch (escrowErr: any) {
                console.error(`[Shipping] Escrow release failed: ${escrowErr.message}`);
            }
        }

        res.json({ shipment: result.shipment, escrowReleased: result.shouldReleaseEscrow });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

// Cancel shipment
app.post('/api/shipping/:id/cancel', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const shipment = await shipping.cancelShipment(req.params.id);
        res.json({ shipment });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

// ============================================================
// SERVER STARTUP
// ============================================================

export async function startServer(): Promise<void> {
    // Initialize services
    await ironClaw.initialize();
    await swarm.start();

    // Listen on events
    swarm.on('task:completed', (task) => {
        console.log(`[Task] Completed: ${task.id} (${task.agentType})`);
    });

    swarm.on('task:failed', (task) => {
        console.error(`[Task] Failed: ${task.id} — ${task.error}`);
    });

    const port = Number(process.env.PORT) || 4000;
    server.listen(port, () => {
        console.log(`[ClawPazar] API server running on port ${port}`);
        console.log(`[ClawPazar] WebSocket server running on ws://localhost:${port}/ws`);
    });
}

// Start server
startServer().catch(console.error);

export { app, server };
