import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow cross-origin requests from the user's remote IP for Hot Module Replacement
  experimental: {
  },
  // @ts-ignore
  allowedDevOrigins: ['10.100.68.57', 'localhost'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '**',
      }
    ],
  },
};

export default nextConfig;
