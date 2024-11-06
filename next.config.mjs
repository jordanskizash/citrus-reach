/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: [
            "files.edgestore.dev"
        ]
    },
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
                    { key: 'Access-Control-Expose-Headers', value: 'Accept-Ranges, Content-Range, Content-Length, Content-Type' }
                ],
            }
        ];
    }
};

export default nextConfig;