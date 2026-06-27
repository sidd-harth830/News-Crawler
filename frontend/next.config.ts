import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow cross-origin requests from the user's remote IP for Hot Module Replacement
  experimental: {
    // Some versions use experimental, others root. We can do both or just what the log said.
  },
  // The log specifically said "allowedDevOrigins" at root level.
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
