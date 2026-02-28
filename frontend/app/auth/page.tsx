'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { PawPrint, Phone, ChevronRight, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/store';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function AuthPage() {
    const router = useRouter();
    const login = useAuth((s) => s.login);
    const [phone, setPhone] = useState('');
    const [step, setStep] = useState<'phone' | 'code' | 'success'>('phone');
    const [code, setCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isDemo, setIsDemo] = useState(false);

    const sendOtp = async () => {
        if (phone.length < 10) {
            setError('Geçerli bir telefon numarası girin');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API}/api/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: `+90${phone}` }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setIsDemo(data.demo === true);
            setStep('code');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Bağlantı hatası');
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async () => {
        if (code.length !== 6) {
            setError('6 haneli kodu girin');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API}/api/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: `+90${phone}`, code }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            // Store token and user data
            login(data.token, {
                id: data.user.id,
                email: data.user.phone,
                displayName: data.user.displayName,
                role: data.user.role,
            });

            setStep('success');
            setTimeout(() => router.push('/'), 1500);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Doğrulama hatası');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-dvh px-6 relative overflow-hidden retro-grid">
            {/* Background glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#6B00FF]/15 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/3 right-0 w-48 h-48 bg-[#00F0FF]/10 rounded-full blur-[80px] pointer-events-none" />

            <motion.div
                className="w-full max-w-sm"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <motion.div
                        className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#6B00FF]/20 to-[#00F0FF]/10 border border-[var(--neon-purple)]/30 mb-4 scanline-overlay"
                        animate={{ boxShadow: ['0 0 0 3px rgba(107,0,255,0.1)', '0 0 20px rgba(107,0,255,0.25)', '0 0 0 3px rgba(107,0,255,0.1)'] }}
                        transition={{ duration: 3, repeat: Infinity }}
                    >
                        <PawPrint className="w-9 h-9 text-[var(--neon-purple)] icon-neon" strokeWidth={1.5} />
                    </motion.div>
                    <h1 className="text-2xl font-bold neon-text" style={{ fontFamily: 'var(--font-display)' }}>ClawPazar</h1>
                    <p className="text-xs text-[var(--color-text-muted)] mt-2 font-retro">TELEFON NUMARANIZLA GİRİŞ YAPIN</p>
                </div>

                {/* Form */}
                <div className="neon-card p-6 space-y-4">
                    <AnimatePresence mode="wait">
                        {step === 'phone' && (
                            <motion.div key="phone" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                                <div className="flex items-center gap-2 rounded-xl bg-[var(--color-surface-base)] border border-[var(--neon-purple)]/15 px-4 py-3 focus-within:border-[var(--neon-cyan)]/40 focus-within:shadow-[0_0_16px_rgba(0,240,255,0.1)] transition-all">
                                    <Phone className="w-4 h-4 text-[var(--color-text-muted)]" strokeWidth={1.5} />
                                    <span className="text-sm text-[var(--color-text-secondary)]">+90</span>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                        placeholder="5XX XXX XX XX"
                                        className="flex-1 bg-transparent text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none"
                                        maxLength={10}
                                    />
                                </div>
                                <motion.button
                                    onClick={sendOtp}
                                    disabled={loading}
                                    className="w-full neon-btn rounded-xl py-3.5 text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50"
                                    whileTap={{ scale: 0.97 }}
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Kod Gönder <ChevronRight className="w-4 h-4" /></>}
                                </motion.button>
                            </motion.div>
                        )}

                        {step === 'code' && (
                            <motion.div key="code" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                                <p className="text-xs text-[var(--color-text-secondary)] text-center">+90 {phone} numarasına kod gönderildi</p>
                                {isDemo && (
                                    <div className="text-center text-[10px] font-retro text-[var(--neon-cyan)] bg-[var(--neon-cyan)]/10 rounded-lg px-3 py-1.5">
                                        DEMO MOD — Kod: 123456
                                    </div>
                                )}
                                <input
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                                    placeholder="• • • • • •"
                                    className="w-full rounded-xl bg-[var(--color-surface-base)] border border-[var(--neon-purple)]/15 px-4 py-3 text-center text-lg font-retro tracking-[0.5em] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--neon-cyan)]/40 transition-all"
                                    maxLength={6}
                                    autoFocus
                                />
                                <motion.button
                                    onClick={verifyOtp}
                                    disabled={loading}
                                    className="w-full neon-btn rounded-xl py-3.5 text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50"
                                    whileTap={{ scale: 0.97 }}
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Giriş Yap'}
                                </motion.button>
                                <button onClick={() => { setStep('phone'); setCode(''); setError(null); }} className="w-full text-xs text-[var(--color-text-muted)] hover:text-[var(--neon-cyan)] transition-colors">
                                    Numarayı Değiştir
                                </button>
                            </motion.div>
                        )}

                        {step === 'success' && (
                            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                                <CheckCircle className="w-12 h-12 text-[var(--neon-green)] mx-auto mb-3" />
                                <h3 className="text-lg font-bold text-[var(--color-text-primary)]">Giriş Başarılı!</h3>
                                <p className="text-xs text-[var(--color-text-muted)] mt-1">Ana sayfaya yönlendiriliyorsunuz...</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Error */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex items-center gap-2 text-xs text-[var(--neon-pink)] bg-[var(--neon-pink)]/10 rounded-lg px-3 py-2"
                            >
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Step indicators */}
                <div className="flex justify-center gap-2 mt-6">
                    {['phone', 'code', 'success'].map((s, i) => (
                        <div
                            key={s}
                            className={`h-1.5 rounded-full transition-all ${step === s
                                ? 'w-6 bg-[var(--neon-purple)] shadow-[0_0_8px_rgba(107,0,255,0.4)]'
                                : i < ['phone', 'code', 'success'].indexOf(step)
                                    ? 'w-3 bg-[var(--neon-green)]'
                                    : 'w-1.5 bg-[var(--color-text-muted)]/30'
                                }`}
                        />
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
