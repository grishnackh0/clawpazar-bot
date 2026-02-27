/**
 * ClawPazar — Config & Environment
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ── Load .env ──
const envPath = resolve(import.meta.dirname || __dirname, '..', '.env');
try {
    const envFile = readFileSync(envPath, 'utf-8');
    for (const line of envFile.split('\n')) {
        const t = line.trim();
        if (!t || t.startsWith('#')) continue;
        const eq = t.indexOf('=');
        if (eq < 0) continue;
        const k = t.slice(0, eq).trim();
        const v = t.slice(eq + 1).trim();
        if (!process.env[k]) process.env[k] = v;
    }
} catch { }

// ── Telegram ──
export const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
export const LLM_KEY = process.env.ZHIPU_API_KEY || '';
export const LLM_BASE = process.env.ZHIPU_API_BASE || 'https://open.bigmodel.cn/api/paas/v4';
export const LLM_MODEL = process.env.ZHIPU_MODEL || 'glm-4-flash';
export const TG = `https://api.telegram.org/bot${BOT_TOKEN}`;

// ── Supabase ──
export const SUPABASE_URL = process.env.SUPABASE_URL || '';
export const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
export const supabase: SupabaseClient | null = SUPABASE_URL && SUPABASE_SERVICE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { persistSession: false } })
    : null;

// ── iyzico ──
export const IYZICO_API_KEY = process.env.IYZICO_API_KEY || '';
export const IYZICO_SECRET_KEY = process.env.IYZICO_SECRET_KEY || '';
export const IYZICO_BASE_URL = process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com';

// ── WhatsApp ──
export const WA_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || '';
export const WA_PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
export const WA_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'clawpazar-verify-2026';
export const WA_API = `https://graph.facebook.com/v19.0/${WA_PHONE_ID}`;

// ── Startup logs ──
if (!BOT_TOKEN) { console.error('❌ TELEGRAM_BOT_TOKEN boş'); process.exit(1); }
if (!LLM_KEY) { console.error('❌ ZHIPU_API_KEY boş'); process.exit(1); }
if (supabase) console.log('  ✅ Supabase bağlı');
else console.log('  ⚠️ Supabase yok — offline mod');
if (IYZICO_API_KEY) console.log('  ✅ iyzico bağlı (sandbox)');
else console.log('  ⚠️ iyzico yok — escrow devre dışı');
if (WA_ACCESS_TOKEN) console.log('  ✅ WhatsApp bağlı');
else console.log('  ⚠️ WhatsApp yok — sadece Telegram');
