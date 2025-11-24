/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // 静的エクスポート（Render等の静的ホスティング用）
  output: 'export',
  // 末尾スラッシュ（静的ホスティングでのルーティング用）
  trailingSlash: true,
}

module.exports = nextConfig
