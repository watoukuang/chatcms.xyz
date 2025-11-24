/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 生成可独立运行的产物，便于 Docker 仅拷贝最小运行时
  output: 'standalone',
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },
  i18n: {
    locales: ['zh'],
    defaultLocale: 'zh',
  },
  async redirects() {
    return [
      {
        source: '/subscribe',
        destination: '/',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/service/v1/:path*',
        destination: 'http://localhost:8081/api/v1/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
