/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.NEXT_OUTPUT_MODE || (process.platform === 'win32' ? undefined : 'standalone'),
  reactStrictMode: true,
  transpilePackages: [
    '@e2m/ui',
    'antd',
    '@ant-design',
    'rc-util',
    'rc-pagination',
    'rc-picker',
    'rc-notification',
    'rc-tooltip',
    'rc-tree',
    'rc-table',
    '@ant-design/icons',
    '@ant-design/icons-svg',
    '@ant-design/nextjs-registry',
    '@ant-design/cssinjs',
  ],
  // Allow API requests to the backend during development
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
