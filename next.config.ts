import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [375, 430, 768, 1024, 1280, 1920, 2560],
    imageSizes: [320, 640, 960, 1280],
    qualities: [75, 80, 85, 90, 95],
  },
  experimental: {
    optimizeCss: false,
  },
}

export default nextConfig
