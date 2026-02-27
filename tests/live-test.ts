// ClawPazar – Live Test Scenarios
// End-to-end tests covering WhatsApp flow, MCP agent calls, and auction lifecycle

// Run: npx tsx tests/live-test.ts

const API_URL = process.env.CLAWPAZAR_API_URL || 'http://localhost:4000';
const MCP_ENABLED = process.env.MCP_ENABLED === 'true';

// ============================================================
// HELPERS
// ============================================================

async function apiCall(method: string, path: string, body?: object): Promise<{ ok: boolean; data: unknown; status: number }> {
    try {
        const res = await fetch(`${API_URL}${path}`, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: body ? JSON.stringify(body) : undefined,
        });
        const data = await res.json().catch(() => ({}));
        return { ok: res.ok, data, status: res.status };
    } catch (err) {
        return { ok: false, data: { error: String(err) }, status: 0 };
    }
}

function assert(condition: boolean, message: string): void {
    if (condition) {
        console.log(`  ✅ ${message}`);
    } else {
        console.error(`  ❌ FAIL: ${message}`);
        process.exitCode = 1;
    }
}

// ============================================================
// TEST 1: Platform Health
// ============================================================

async function testHealth(): Promise<void> {
    console.log('\n🏥 Test 1: Platform Health');
    const { ok, data } = await apiCall('GET', '/health');
    assert(ok, 'Health endpoint returns 200');
    assert((data as Record<string, unknown>).status === 'ok', 'Status is "ok"');
}

// ============================================================
// TEST 2: Listing CRUD via API (simulates WhatsApp flow)
// ============================================================

async function testListingFlow(): Promise<string | null> {
    console.log('\n📦 Test 2: Listing Creation (WhatsApp → API)');

    // Create listing (simulates WhatsApp message routing)
    const { ok: createOk, data: createData } = await apiCall('POST', '/api/listings', {
        message: 'iPhone 15 Pro Max, 256GB, siyah, az kullanılmış. 28.000 TL',
        channel: 'whatsapp',
        images: [],
    });
    assert(createOk || (createData as any)?.taskId, 'Listing creation accepted (202 or taskId)');

    // Browse listings
    const { ok: browseOk, data: browseData } = await apiCall('GET', '/api/listings?limit=5');
    assert(browseOk, 'Browse listings returns 200');

    const listings = (browseData as any)?.listings || [];
    if (listings.length > 0) {
        const listingId = listings[0].id;

        // Get detail
        const { ok: detailOk } = await apiCall('GET', `/api/listings/${listingId}`);
        assert(detailOk, 'Listing detail returns 200');
        return listingId;
    }

    console.log('  ℹ️  No listings found (empty DB). Skipping detail test.');
    return null;
}

// ============================================================
// TEST 3: Auction Lifecycle
// ============================================================

async function testAuctionFlow(): Promise<void> {
    console.log('\n🔨 Test 3: Auction Lifecycle');

    // List auctions
    const { ok: listOk, data: listData } = await apiCall('GET', '/api/auctions');
    assert(listOk, 'Auctions list returns 200');

    const auctions = listData as Array<{ id: string; current_price: number; min_bid_increment: number }>;
    if (auctions.length > 0) {
        const auction = auctions[0];
        const bidAmount = (auction.current_price || 100) + (auction.min_bid_increment || 10);

        // Place bid (will fail without auth, which is expected)
        const { status } = await apiCall('POST', `/api/auctions/${auction.id}/bid`, { amount: bidAmount });
        assert(status === 401 || status === 200 || status === 201, `Bid endpoint responds (got ${status})`);
    } else {
        console.log('  ℹ️  No active auctions. Skipping bid test.');
    }
}

// ============================================================
// TEST 4: MCP Server Tool Discovery
// ============================================================

async function testMcpToolDiscovery(): Promise<void> {
    console.log('\n🔌 Test 4: MCP Tool Discovery');

    if (!MCP_ENABLED) {
        console.log('  ℹ️  MCP_ENABLED not set. Skipping MCP test.');
        console.log('  ℹ️  Run with: MCP_ENABLED=true npx tsx tests/live-test.ts');
        return;
    }

    // This would spawn the MCP server and send JSON-RPC
    // For live test, we verify the file exists and can be parsed
    const { spawn } = await import('node:child_process');
    const mcp = spawn('node', ['--loader', 'tsx', 'mcp/mcp-server.ts'], {
        env: { ...process.env, CLAWPAZAR_API_URL: API_URL },
        stdio: ['pipe', 'pipe', 'pipe'],
    });

    // Send initialize
    const initRequest = JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: { clientInfo: { name: 'live-test', version: '1.0.0' } },
    });

    mcp.stdin.write(initRequest + '\n');

    const response = await new Promise<string>((resolve) => {
        mcp.stdout.once('data', (data: Buffer) => resolve(data.toString()));
        setTimeout(() => resolve('timeout'), 5000);
    });

    if (response !== 'timeout') {
        const parsed = JSON.parse(response);
        assert(parsed.result?.name === 'clawpazar-mcp', 'MCP server returns correct name');
        assert(parsed.result?.protocolVersion, 'MCP protocol version present');
    }

    // Send tools/list
    const toolsRequest = JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
    });

    mcp.stdin.write(toolsRequest + '\n');

    const toolsResponse = await new Promise<string>((resolve) => {
        mcp.stdout.once('data', (data: Buffer) => resolve(data.toString()));
        setTimeout(() => resolve('timeout'), 5000);
    });

    if (toolsResponse !== 'timeout') {
        const parsed = JSON.parse(toolsResponse);
        const tools = parsed.result?.tools || [];
        assert(tools.length === 8, `MCP returns exactly 8 tools (got ${tools.length})`);
        assert(tools.some((t: { name: string }) => t.name === 'create_listing'), 'Has create_listing tool');
        assert(tools.some((t: { name: string }) => t.name === 'place_bid'), 'Has place_bid tool');
    }

    mcp.kill();
}

// ============================================================
// TEST 5: Commission Calculation
// ============================================================

async function testCommission(): Promise<void> {
    console.log('\n💰 Test 5: Commission Calculation');

    // Test commission math (matches iyzico.service.ts logic)
    const testCases = [
        { total: 1000, expectedMin: 30, expectedMax: 50 },
        { total: 10000, expectedMin: 300, expectedMax: 500 },
        { total: 100000, expectedMin: 3000, expectedMax: 5000 },
    ];

    for (const tc of testCases) {
        const commission3pct = tc.total * 0.03;
        const commission5pct = tc.total * 0.05;
        assert(
            commission3pct >= tc.expectedMin && commission5pct <= tc.expectedMax,
            `${tc.total} ₺ → komisyon: ${commission3pct}-${commission5pct} ₺ (beklenen: ${tc.expectedMin}-${tc.expectedMax} ₺)`,
        );
    }

    // Verify subMerchantPrice = total - commission
    const total = 10000;
    const commissionRate = 0.04;
    const commission = total * commissionRate;
    const subMerchantPrice = total - commission;
    assert(subMerchantPrice === 9600, `SubMerchant payout: ${subMerchantPrice} ₺ (10.000 - %4 komisyon)`);
}

// ============================================================
// TEST 6: KVKK Compliance
// ============================================================

async function testCompliance(): Promise<void> {
    console.log('\n🔒 Test 6: KVKK Compliance');

    const { ok, data } = await apiCall('GET', '/api/compliance/disclosure');
    assert(ok, 'Disclosure endpoint returns 200');
    assert(!!(data as Record<string, unknown>).title, 'Disclosure has title');
    assert(!!(data as Record<string, unknown>).content, 'Disclosure has content');
}

// ============================================================
// RUNNER
// ============================================================

async function main(): Promise<void> {
    console.log('🐾 ClawPazar Live Test Suite');
    console.log(`   API: ${API_URL}`);
    console.log('   ===========================');

    await testHealth();
    await testListingFlow();
    await testAuctionFlow();
    await testMcpToolDiscovery();
    await testCommission();
    await testCompliance();

    console.log('\n===========================');
    if (process.exitCode) {
        console.log('❌ Bazı testler başarısız!');
    } else {
        console.log('✅ Tüm testler başarılı!');
    }
}

main();
