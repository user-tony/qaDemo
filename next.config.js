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
  experimental: {
    // 启用增量构建
    incrementalBuild: true,
    // 启用服务器组件
    serverComponents: true,
  },
  // 禁用图像优化（如果不需要）
  images: {
    unoptimized: true,
  },
  // 输出独立构建
  output: 'standalone',
}

module.exports = nextConfig
