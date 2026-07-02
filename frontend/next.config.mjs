/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // In production, rewrites are not needed - frontend calls API directly
    // In development, rewrite /api calls to backend server
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    // Only use rewrites in development
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: `${backendUrl}/api/:path*`,
        },
        {
          source: '/uploads/:path*',
          destination: `${backendUrl}/uploads/:path*`,
        },
      ];
    }
    
    return [];
  },
};

export default nextConfig;

