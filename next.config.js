/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    dangerouslyAllowLocalIP: true,
    // Allow images from your PocketBase server
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8090',
        pathname: '/api/files/**',
      },
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/api/files/**',
      },
    ],
  },
}

module.exports = nextConfig
