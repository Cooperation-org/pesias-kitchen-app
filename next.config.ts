import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'pesias-kitchen-api-git-main-agneskoinanges-projects.vercel.app',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pesias-kitchen-api-git-main-agneskoinanges-projects.vercel.app',
        port: '',
        pathname: '/**',
      },
      
    ],
    domains: ['images.unsplash.com'],
  },

  typescript: {
    ignoreBuildErrors: true,
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  }
};
export default nextConfig;