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
  },
  webpack: (config) => {
    // Fix module resolution issues
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/providers/Web3Provider': require.resolve('./providers/Web3Provider.tsx'),
      '@/providers/web3Provider': require.resolve('./providers/Web3Provider.tsx'),
    };
    
    // Fix Tailwind CSS issues
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    
    return config;
  },
  experimental: {
    esmExternals: false,
  },
};

export default nextConfig;