/** @type {import('next').NextConfig} */
const nextConfig = {
  sassOptions: {
    compiler: "modern",
    silenceDeprecations: ["legacy-js-api"],
  },
  // Allow Next.js Server Actions from known development origins
  experimental: {
    serverActions: {
      allowedOrigins: [
        // Local development origin and host
        'http://localhost:3000',
        'localhost:3000',
        // Codespaces forwarded host (with and without protocol)
        'https://vigilant-space-broccoli-9p99q7wxq5qf4w-3000.app.github.dev',
        'vigilant-space-broccoli-9p99q7wxq5qf4w-3000.app.github.dev',
      ],
      bodySizeLimit: '30mb', // or higher, e.g. '20mb'
    },
  },  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'jsldybdbxojaugvnlklz.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/student-resumes/**',
      },
      {
        protocol: 'https',
        hostname: 'www.google.com',
        port: '',
        pathname: '/s2/favicons/**',
      },
      {
        protocol: 'https',
        hostname: 'favicon.yandex.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'icons.duckduckgo.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.gstatic.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.faviconkit.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
