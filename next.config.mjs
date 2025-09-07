/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: [
        "files.edgestore.dev"
      ]
    },
    eslint: {
      // Don't fail the build for ESLint errors in production
      ignoreDuringBuilds: true,
    },
    typescript: {
      // Don't fail the build for TypeScript errors in production
      ignoreBuildErrors: true
    },
    output: 'standalone',


    async headers() {
      return [
        {
          source: '/api/edgestore/:path*',
          headers: [
            { key: 'Access-Control-Allow-Origin', value: '*' },
            { key: 'Access-Control-Allow-Methods', value: 'GET, HEAD, OPTIONS' },
            { key: 'Access-Control-Allow-Headers', value: 'Range' },
            { key: 'Access-Control-Expose-Headers', value: 'Accept-Ranges, Content-Range, Content-Length, Content-Type' },
            { key: 'Accept-Ranges', value: 'bytes' }
          ],
        },
        {
          // Add headers for the actual video files
          source: '/:path*',
          headers: [
            { key: 'Accept-Ranges', value: 'bytes' },
            { key: 'Access-Control-Allow-Origin', value: '*' },
            { key: 'Access-Control-Allow-Methods', value: 'GET, HEAD, OPTIONS' },
            { key: 'Access-Control-Allow-Headers', value: 'Range' },
            { key: 'Access-Control-Expose-Headers', value: 'Accept-Ranges, Content-Range, Content-Length, Content-Type' },
            // Security headers
            { key: 'X-Frame-Options', value: 'DENY' },
            { key: 'X-Content-Type-Options', value: 'nosniff' },
            { key: 'X-XSS-Protection', value: '1; mode=block' }
          ],
        }
      ];
    },
    webpack: (config, { isServer }) => {
      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false,
          net: false,
          tls: false,
        };
      }
      return config;
    },
  };
  
  export default nextConfig;