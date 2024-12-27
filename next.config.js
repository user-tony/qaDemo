/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // ⚠️ 警告：仅在开发时使用，生产环境建议修复类型错误
    ignoreBuildErrors: true,
  },
  eslint: {
    // ⚠️ 警告：仅在开发时使用，生产环境建议修复 ESLint 错误
    ignoreDuringBuilds: true,
  },
  // 禁用图像优化（如果不需要）
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
