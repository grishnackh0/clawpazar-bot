import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    output: 'standalone',
    reactStrictMode: true,
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: '*.supabase.co' },
            { protocol: 'https', hostname: '*.supabase.in' },
            { protocol: 'http', hostname: 'localhost' },
        ],
    },
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                ],
            },
        ];
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/:path*`,
            },
        ];
    },
};

export default nextConfig;
