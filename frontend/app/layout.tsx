import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'ClawPazar – Sat, AI, Kazan',
    description: 'Türkiye\'nin ajan-yönelimli ikinci el marketplace\'i. Sesli mesajla ilan oluştur, canlı mezatlarda kazan.',
    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
        title: 'ClawPazar',
    },
    openGraph: {
        title: 'ClawPazar – Sat, AI, Kazan',
        description: 'AI ajanlarla saniyeler içinde ilan oluştur. Canlı mezat, otomatik pazarlık, güvenli ödeme.',
        siteName: 'ClawPazar',
        locale: 'tr_TR',
        type: 'website',
    },
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
    themeColor: '#0A0A0A',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="tr" className="dark">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&family=Outfit:wght@600;700;800;900&display=swap"
                    rel="stylesheet"
                />
                <link rel="apple-touch-icon" href="/icon-192.png" />
            </head>
            <body className="min-h-dvh antialiased">
                <main className="mx-auto max-w-lg min-h-dvh relative">
                    {children}
                </main>
            </body>
        </html>
    );
}
