'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Package, Wallet, Star, ClipboardList, Receipt, Heart,
    MessageSquare, Settings, Shield, ChevronRight, LogIn, LogOut,
    Loader2, Moon, Sun, Bell, BellOff, Globe, Lock, Trash2,
    Download, FileText, ChevronDown, X, Eye, Phone
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/BottomNav';
import { useAuth } from '@/lib/store';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type ModalType = 'ayarlar' | 'kvkk' | null;

export default function ProfilPage() {
    const router = useRouter();
    const { isAuthenticated, token, displayName, logout } = useAuth();
    const [profile, setProfile] = useState<{ id: string; displayName: string; role: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [activeModal, setActiveModal] = useState<ModalType>(null);

    // Settings state
    const [darkMode, setDarkMode] = useState(true);
    const [notifications, setNotifications] = useState(true);
    const [language, setLanguage] = useState<'tr' | 'en'>('tr');

    // KVKK state
    const [kvkkLoading, setKvkkLoading] = useState(false);
    const [kvkkMessage, setKvkkMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated || !token) return;
        setLoading(true);
        fetch(`${API}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.json())
            .then((d) => setProfile(d.user))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [isAuthenticated, token]);

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    const handleDataExport = async () => {
        setKvkkLoading(true);
        setKvkkMessage(null);
        try {
            const res = await fetch(`${API}/api/compliance/export`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            if (res.ok) {
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'clawpazar-verilerim.json';
                a.click();
                setKvkkMessage('✅ Verileriniz indirildi.');
            } else {
                setKvkkMessage('⚠️ Backend bağlantısı yok. Veriler backend çalıştığında indirilebilir.');
            }
        } catch {
            setKvkkMessage('⚠️ Backend bağlantısı yok. Veriler backend çalıştığında indirilebilir.');
        } finally {
            setKvkkLoading(false);
        }
    };

    const handleAccountDelete = async () => {
        if (!confirm('Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) return;
        setKvkkLoading(true);
        try {
            const res = await fetch(`${API}/api/compliance/delete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });
            if (res.ok) {
                setKvkkMessage('✅ Hesap silme talebiniz alındı. 30 gün içinde tüm verileriniz silinecektir.');
                setTimeout(() => { logout(); router.push('/'); }, 3000);
            } else {
                setKvkkMessage('⚠️ Backend bağlantısı yok. Talep backend çalıştığında işlenecek.');
            }
        } catch {
            setKvkkMessage('⚠️ Backend bağlantısı yok. Talep backend çalıştığında işlenecek.');
        } finally {
            setKvkkLoading(false);
        }
    };

    const menuItems = [
        { label: 'İlanlarım', icon: ClipboardList, href: '/kesfet?mine=true' },
        { label: 'Satışlarım', icon: Receipt, href: '/kesfet?sold=true' },
        { label: 'Favorilerim', icon: Heart, href: '/kesfet?favorites=true' },
        { label: 'Mesajlar', icon: MessageSquare, href: '/sohbet' },
    ];

    return (
        <div className="pb-24 min-h-dvh">
            <div className="px-5 pt-6">
                {/* Avatar */}
                <motion.div className="flex flex-col items-center py-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="relative">
                        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#6B00FF] to-[#00F0FF] p-[2px] animate-glow-ring">
                            <div className="h-full w-full rounded-full bg-[var(--color-surface-base)] flex items-center justify-center scanline-overlay">
                                <User className="w-8 h-8 text-[var(--color-text-muted)] icon-neon" strokeWidth={1} />
                            </div>
                        </div>
                        {isAuthenticated && (
                            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-[var(--neon-green)] border-2 border-[var(--color-surface-base)] flex items-center justify-center">
                                <Star className="w-3 h-3 text-[var(--color-surface-base)]" strokeWidth={3} />
                            </div>
                        )}
                    </div>
                    <h2 className="text-lg font-bold mt-3">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (profile?.displayName || displayName || 'Kullanıcı')}
                    </h2>
                    <p className="text-xs text-[var(--color-text-muted)] font-retro">
                        {isAuthenticated ? (profile?.role?.toUpperCase() || 'SATICI') : 'GİRİŞ YAPILMADI'}
                    </p>
                </motion.div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                        { value: '0', label: 'İlan', icon: Package },
                        { value: '0', label: 'Satış', icon: Wallet },
                        { value: '—', label: 'Puan', icon: Star },
                    ].map((stat) => {
                        const StatIcon = stat.icon;
                        return (
                            <div key={stat.label} className="neon-card p-3 text-center">
                                <StatIcon className="w-4 h-4 mx-auto mb-1 icon-neon text-[var(--neon-cyan)]" strokeWidth={1.5} />
                                <div className="text-lg font-bold neon-text font-retro">{stat.value}</div>
                                <div className="text-[11px] text-[var(--color-text-muted)] mt-0.5">{stat.label}</div>
                            </div>
                        );
                    })}
                </div>

                {/* Menu */}
                <div className="space-y-2">
                    {menuItems.map((item) => {
                        const MenuIcon = item.icon;
                        return (
                            <Link key={item.label} href={item.href}>
                                <motion.div
                                    className="flex w-full items-center gap-3 neon-card p-3.5 text-left"
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <MenuIcon className="w-5 h-5 text-[var(--color-text-muted)] icon-neon" strokeWidth={1.5} />
                                    <span className="text-sm font-medium text-[var(--color-text-primary)] flex-1">{item.label}</span>
                                    <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)]" strokeWidth={1.5} />
                                </motion.div>
                            </Link>
                        );
                    })}

                    {/* Ayarlar button */}
                    <motion.button
                        onClick={() => setActiveModal('ayarlar')}
                        className="flex w-full items-center gap-3 neon-card p-3.5 text-left"
                        whileTap={{ scale: 0.98 }}
                    >
                        <Settings className="w-5 h-5 text-[var(--color-text-muted)] icon-neon" strokeWidth={1.5} />
                        <span className="text-sm font-medium text-[var(--color-text-primary)] flex-1">Ayarlar</span>
                        <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)]" strokeWidth={1.5} />
                    </motion.button>

                    {/* KVKK button */}
                    <motion.button
                        onClick={() => setActiveModal('kvkk')}
                        className="flex w-full items-center gap-3 neon-card p-3.5 text-left"
                        whileTap={{ scale: 0.98 }}
                    >
                        <Shield className="w-5 h-5 text-[var(--color-text-muted)] icon-neon" strokeWidth={1.5} />
                        <span className="text-sm font-medium text-[var(--color-text-primary)] flex-1">KVKK & Gizlilik</span>
                        <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)]" strokeWidth={1.5} />
                    </motion.button>
                </div>

                {/* Auth button */}
                {isAuthenticated ? (
                    <motion.button
                        onClick={handleLogout}
                        className="w-full rounded-xl py-3.5 text-sm font-semibold text-[var(--neon-pink)] mt-6 flex items-center justify-center gap-2 border border-[var(--neon-pink)]/30 hover:bg-[var(--neon-pink)]/10 transition-colors"
                        whileTap={{ scale: 0.97 }}
                    >
                        <LogOut className="w-4 h-4" strokeWidth={2} />
                        Çıkış Yap
                    </motion.button>
                ) : (
                    <Link href="/auth">
                        <motion.div
                            className="w-full neon-btn rounded-xl py-3.5 text-sm font-semibold text-white mt-6 flex items-center justify-center gap-2"
                            whileTap={{ scale: 0.97 }}
                        >
                            <LogIn className="w-4 h-4" strokeWidth={2} />
                            Giriş Yap / Kayıt ol
                        </motion.div>
                    </Link>
                )}
            </div>

            {/* ═══════════════ MODALS ═══════════════ */}
            <AnimatePresence>
                {activeModal && (
                    <motion.div
                        className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setActiveModal(null)}
                    >
                        <motion.div
                            className="w-full max-w-lg bg-[var(--color-surface-elevated)] rounded-t-3xl p-6 pb-10 max-h-[85vh] overflow-y-auto"
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Drag indicator */}
                            <div className="w-10 h-1 rounded-full bg-[var(--color-text-muted)]/30 mx-auto mb-5" />

                            {/* Close button */}
                            <button
                                onClick={() => setActiveModal(null)}
                                className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-white/5 transition-colors"
                            >
                                <X className="w-5 h-5 text-[var(--color-text-muted)]" />
                            </button>

                            {/* ── AYARLAR MODAL ── */}
                            {activeModal === 'ayarlar' && (
                                <div className="space-y-5">
                                    <h2 className="text-lg font-bold flex items-center gap-2">
                                        <Settings className="w-5 h-5 icon-neon text-[var(--neon-cyan)]" />
                                        Ayarlar
                                    </h2>

                                    {/* Dark Mode */}
                                    <div className="flex items-center justify-between neon-card p-4">
                                        <div className="flex items-center gap-3">
                                            {darkMode ? <Moon className="w-5 h-5 text-[var(--neon-purple)]" /> : <Sun className="w-5 h-5 text-[var(--neon-orange)]" />}
                                            <div>
                                                <p className="text-sm font-medium">Karanlık Mod</p>
                                                <p className="text-[11px] text-[var(--color-text-muted)]">{darkMode ? 'Aktif' : 'Kapalı'}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setDarkMode(!darkMode)}
                                            className={`relative w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-[var(--neon-purple)]' : 'bg-[var(--color-text-muted)]/30'}`}
                                        >
                                            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-lg transition-transform ${darkMode ? 'left-6' : 'left-0.5'}`} />
                                        </button>
                                    </div>

                                    {/* Notifications */}
                                    <div className="flex items-center justify-between neon-card p-4">
                                        <div className="flex items-center gap-3">
                                            {notifications ? <Bell className="w-5 h-5 text-[var(--neon-green)]" /> : <BellOff className="w-5 h-5 text-[var(--color-text-muted)]" />}
                                            <div>
                                                <p className="text-sm font-medium">Bildirimler</p>
                                                <p className="text-[11px] text-[var(--color-text-muted)]">{notifications ? 'Aktif' : 'Kapalı'}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setNotifications(!notifications)}
                                            className={`relative w-12 h-6 rounded-full transition-colors ${notifications ? 'bg-[var(--neon-green)]' : 'bg-[var(--color-text-muted)]/30'}`}
                                        >
                                            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-lg transition-transform ${notifications ? 'left-6' : 'left-0.5'}`} />
                                        </button>
                                    </div>

                                    {/* Language */}
                                    <div className="flex items-center justify-between neon-card p-4">
                                        <div className="flex items-center gap-3">
                                            <Globe className="w-5 h-5 text-[var(--neon-cyan)]" />
                                            <div>
                                                <p className="text-sm font-medium">Dil</p>
                                                <p className="text-[11px] text-[var(--color-text-muted)]">{language === 'tr' ? 'Türkçe' : 'English'}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => setLanguage('tr')}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${language === 'tr' ? 'bg-[var(--neon-cyan)]/20 text-[var(--neon-cyan)] border border-[var(--neon-cyan)]/30' : 'text-[var(--color-text-muted)] hover:bg-white/5'}`}
                                            >
                                                TR
                                            </button>
                                            <button
                                                onClick={() => setLanguage('en')}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${language === 'en' ? 'bg-[var(--neon-cyan)]/20 text-[var(--neon-cyan)] border border-[var(--neon-cyan)]/30' : 'text-[var(--color-text-muted)] hover:bg-white/5'}`}
                                            >
                                                EN
                                            </button>
                                        </div>
                                    </div>

                                    {/* Account Info */}
                                    <div className="neon-card p-4 space-y-3">
                                        <p className="text-xs font-retro text-[var(--color-text-muted)] uppercase">Hesap Bilgileri</p>
                                        <div className="flex items-center gap-3">
                                            <Phone className="w-4 h-4 text-[var(--color-text-muted)]" />
                                            <span className="text-sm text-[var(--color-text-secondary)]">
                                                {isAuthenticated ? '+90 5** *** ** **' : 'Giriş yapılmadı'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Eye className="w-4 h-4 text-[var(--color-text-muted)]" />
                                            <span className="text-sm text-[var(--color-text-secondary)]">Üyelik: {isAuthenticated ? 'Aktif' : '—'}</span>
                                        </div>
                                    </div>

                                    {/* App version */}
                                    <div className="text-center pt-2">
                                        <p className="text-[10px] text-[var(--color-text-muted)] font-retro">ClawPazar v1.0.0 — Neon Build</p>
                                    </div>
                                </div>
                            )}

                            {/* ── KVKK MODAL ── */}
                            {activeModal === 'kvkk' && (
                                <div className="space-y-5">
                                    <h2 className="text-lg font-bold flex items-center gap-2">
                                        <Shield className="w-5 h-5 icon-neon text-[var(--neon-green)]" />
                                        KVKK & Gizlilik
                                    </h2>

                                    {/* Info */}
                                    <div className="neon-card p-4">
                                        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                                            ClawPazar, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında
                                            verilerinizi korur. Aşağıdaki haklarınızı kullanabilirsiniz:
                                        </p>
                                    </div>

                                    {/* Rights */}
                                    <div className="space-y-2">
                                        <div className="neon-card p-4">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Lock className="w-4 h-4 text-[var(--neon-cyan)]" />
                                                <p className="text-sm font-medium">Veri İşleme Politikası</p>
                                            </div>
                                            <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
                                                • İlan verileri: Yayında olduğu süre boyunca saklanır{'\n'}
                                                • Adres bilgileri: Teslimattan 30 gün sonra anonimleştirilir{'\n'}
                                                • Ödeme verileri: iyzico tarafından PCI DSS uyumlu saklanır{'\n'}
                                                • Sohbet geçmişi: Oturum boyunca, kalıcı kayıt yapılmaz
                                            </p>
                                        </div>

                                        {/* Export Data */}
                                        <motion.button
                                            onClick={handleDataExport}
                                            disabled={kvkkLoading}
                                            className="flex w-full items-center gap-3 neon-card p-4 text-left"
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Download className="w-5 h-5 text-[var(--neon-cyan)]" />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">Verilerimi İndir</p>
                                                <p className="text-[11px] text-[var(--color-text-muted)]">KVKK md.11 — Veri taşınabilirliği hakkı</p>
                                            </div>
                                            {kvkkLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)]" />}
                                        </motion.button>

                                        {/* Consent Management */}
                                        <div className="neon-card p-4">
                                            <div className="flex items-center gap-3 mb-3">
                                                <FileText className="w-5 h-5 text-[var(--neon-purple)]" />
                                                <div>
                                                    <p className="text-sm font-medium">Rıza Yönetimi</p>
                                                    <p className="text-[11px] text-[var(--color-text-muted)]">Onayladığınız izinler</p>
                                                </div>
                                            </div>
                                            <div className="space-y-2 pl-8">
                                                {[
                                                    { label: 'Zorunlu çerezler', required: true, checked: true },
                                                    { label: 'Analitik çerezler', required: false, checked: true },
                                                    { label: 'Pazarlama bildirimleri', required: false, checked: notifications },
                                                    { label: 'AI içerik üretimi', required: true, checked: true },
                                                ].map((item) => (
                                                    <label key={item.label} className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                                                        <input
                                                            type="checkbox"
                                                            checked={item.checked}
                                                            disabled={item.required}
                                                            onChange={() => { }}
                                                            className="accent-[var(--neon-cyan)]"
                                                        />
                                                        {item.label}
                                                        {item.required && <span className="text-[10px] text-[var(--neon-orange)]">(zorunlu)</span>}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Delete Account */}
                                        <motion.button
                                            onClick={handleAccountDelete}
                                            disabled={kvkkLoading}
                                            className="flex w-full items-center gap-3 rounded-xl border border-[var(--neon-pink)]/30 p-4 text-left hover:bg-[var(--neon-pink)]/5 transition-colors"
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Trash2 className="w-5 h-5 text-[var(--neon-pink)]" />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-[var(--neon-pink)]">Hesabımı Sil</p>
                                                <p className="text-[11px] text-[var(--color-text-muted)]">KVKK md.11 — Unutulma hakkı (30 gün)</p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-[var(--neon-pink)]" />
                                        </motion.button>
                                    </div>

                                    {/* KVKK status message */}
                                    <AnimatePresence>
                                        {kvkkMessage && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="text-xs text-center p-3 rounded-xl bg-[var(--color-surface-base)] border border-[var(--neon-purple)]/15"
                                            >
                                                {kvkkMessage}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Footer */}
                                    <div className="text-center pt-2">
                                        <p className="text-[10px] text-[var(--color-text-muted)] font-retro">
                                            KVKK Veri Sorumlusu: ClawPazar A.Ş.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <BottomNav />
        </div>
    );
}
