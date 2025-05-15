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
    },
  },
};

export default nextConfig;
