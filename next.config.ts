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
      {
        protocol: 'https',
        hostname: 'gateway.pinata.cloud',
        port: '',
        pathname: '/**',
      },
    ],
    domains: ['images.unsplash.com'],
  },

  typescript: {
    ignoreBuildErrors: false,
  },
  
  eslint: {
    ignoreDuringBuilds: false,
  },

  webpack: (config: any) => {
    // Ignore React Native dependencies that MetaMask SDK tries to import
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@react-native-async-storage/async-storage': false,
    };
    
    return config;
  }
};
export default nextConfig;