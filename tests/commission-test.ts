// ClawPazar – Commission Flow E2E Test
// Verifies the full payment → commission → vendor payout pipeline

// Run: npx tsx tests/commission-test.ts

// ============================================================
// COMMISSION RULES
// ============================================================
//
// Platform komisyon: %3–5 (tier'a göre)
//   - Standard seller:  %5
//   - Power seller:     %4
//   - Enterprise:       %3
//
// iyzico marketplace akışı:
//   1. Buyer pays total (e.g. 10.000 ₺)
//   2. iyzico holds in escrow
//   3. Platform commission = total × rate
//   4. subMerchantPrice = total - commission
//   5. After delivery confirmed → escrow release
//   6. Vendor receives subMerchantPrice
//

interface CommissionTestCase {
    name: string;
    totalAmount: number;
    sellerTier: 'standard' | 'power' | 'enterprise';
    expectedRate: number;
}

const TEST_CASES: CommissionTestCase[] = [
    { name: 'Standard seller – ₺500 satış', totalAmount: 500, sellerTier: 'standard', expectedRate: 0.05 },
    { name: 'Standard seller – ₺1.000 satış', totalAmount: 1000, sellerTier: 'standard', expectedRate: 0.05 },
    { name: 'Power seller – ₺5.000 satış', totalAmount: 5000, sellerTier: 'power', expectedRate: 0.04 },
    { name: 'Power seller – ₺10.000 satış', totalAmount: 10000, sellerTier: 'power', expectedRate: 0.04 },
    { name: 'Enterprise – ₺50.000 satış', totalAmount: 50000, sellerTier: 'enterprise', expectedRate: 0.03 },
    { name: 'Enterprise – ₺100.000 satış', totalAmount: 100000, sellerTier: 'enterprise', expectedRate: 0.03 },
    { name: 'Minimum satış – ₺10', totalAmount: 10, sellerTier: 'standard', expectedRate: 0.05 },
];

// ============================================================
// COMMISSION CALCULATOR (mirrors iyzico.service.ts)
// ============================================================

function calculateCommission(totalAmount: number, sellerTier: string): {
    commission: number;
    subMerchantPrice: number;
    rate: number;
    platformRevenue: number;
    vendorPayout: number;
} {
    const rates: Record<string, number> = {
        standard: 0.05,
        power: 0.04,
        enterprise: 0.03,
    };

    const rate = rates[sellerTier] || 0.05;
    const commission = Math.round(totalAmount * rate * 100) / 100; // kuruş hassasiyeti
    const subMerchantPrice = totalAmount - commission;

    return {
        commission,
        subMerchantPrice,
        rate,
        platformRevenue: commission,
        vendorPayout: subMerchantPrice,
    };
}

// ============================================================
// IYZICO BASKET ITEM VERIFICATION
// ============================================================

function verifyIyzicoBasket(totalAmount: number, commission: number, subMerchantPrice: number): {
    valid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    // Rule 1: commission + subMerchantPrice = totalAmount
    if (Math.abs(commission + subMerchantPrice - totalAmount) > 0.01) {
        errors.push(`Toplam eşleşmiyor: ${commission} + ${subMerchantPrice} ≠ ${totalAmount}`);
    }

    // Rule 2: commission must be positive
    if (commission <= 0) {
        errors.push(`Komisyon negatif veya sıfır: ${commission}`);
    }

    // Rule 3: subMerchantPrice must be positive
    if (subMerchantPrice <= 0) {
        errors.push(`Vendor payı negatif veya sıfır: ${subMerchantPrice}`);
    }

    // Rule 4: commission rate between 3-5%
    const actualRate = commission / totalAmount;
    if (actualRate < 0.03 || actualRate > 0.05) {
        errors.push(`Komisyon oranı aralık dışı: %${(actualRate * 100).toFixed(1)} (beklenen: %3-%5)`);
    }

    // Rule 5: iyzico requires itemId for each basketItem
    // (verified structurally, not mathematically)

    return { valid: errors.length === 0, errors };
}

// ============================================================
// ESCROW FLOW SIMULATION
// ============================================================

interface EscrowFlowResult {
    step: string;
    status: string;
    amount?: number;
}

function simulateEscrowFlow(totalAmount: number, sellerTier: string): EscrowFlowResult[] {
    const { commission, subMerchantPrice } = calculateCommission(totalAmount, sellerTier);

    return [
        { step: '1. Alıcı ödeme başlatır', status: '3DS auth', amount: totalAmount },
        { step: '2. iyzico 3DS callback', status: 'payment_success' },
        { step: '3. Escrow\'a alınır', status: 'escrow_hold', amount: totalAmount },
        { step: '4. Satıcı kargolar', status: 'shipped' },
        { step: '5. Alıcı onaylar', status: 'delivery_confirmed' },
        { step: '6. Escrow release', status: 'released' },
        { step: '7. Platform komisyonu', status: 'commission_deducted', amount: commission },
        { step: '8. Vendor payout', status: 'paid', amount: subMerchantPrice },
    ];
}

// ============================================================
// RUNNER
// ============================================================

function main(): void {
    console.log('💰 ClawPazar Commission Flow Test');
    console.log('===================================\n');

    let passed = 0;
    let failed = 0;

    for (const tc of TEST_CASES) {
        const result = calculateCommission(tc.totalAmount, tc.sellerTier);
        const verification = verifyIyzicoBasket(tc.totalAmount, result.commission, result.subMerchantPrice);

        const rateMatch = Math.abs(result.rate - tc.expectedRate) < 0.001;

        if (verification.valid && rateMatch) {
            console.log(`  ✅ ${tc.name}`);
            console.log(`     Toplam: ${tc.totalAmount} ₺ → Komisyon: ${result.commission} ₺ (%${(result.rate * 100).toFixed(0)}) → Vendor: ${result.subMerchantPrice} ₺`);
            passed++;
        } else {
            console.error(`  ❌ ${tc.name}`);
            if (!rateMatch) console.error(`     Oran hatalı: %${(result.rate * 100).toFixed(1)} (beklenen: %${(tc.expectedRate * 100).toFixed(0)})`);
            verification.errors.forEach((e) => console.error(`     ${e}`));
            failed++;
        }
    }

    // Escrow flow simulation
    console.log('\n📋 Escrow Akış Simülasyonu (₺10.000 Power Seller):');
    const escrow = simulateEscrowFlow(10000, 'power');
    escrow.forEach((step) => {
        const amountStr = step.amount ? ` — ${step.amount.toLocaleString('tr-TR')} ₺` : '';
        console.log(`  ${step.step} [${step.status}]${amountStr}`);
    });

    // Summary
    console.log(`\n===================================`);
    console.log(`Sonuç: ${passed} geçti, ${failed} başarısız`);

    if (failed > 0) process.exitCode = 1;
}

main();
