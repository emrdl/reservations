/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
    externalResolver: true,
  },
  async headers() {
    return [
      {
        // API route'ları için CORS ayarları
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
          { key: "Access-Control-Allow-Credentials", value: "true" }
        ]
      }
    ]
  },
  // Debug seçeneği ekleyelim
  future: {
    webpack5: true,
  },
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.devtool = 'source-map';
    }
    return config;
  },
  env: {
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_TRUST_SERVER_CERTIFICATE: process.env.DB_TRUST_SERVER_CERTIFICATE,
  },
  experimental: {
    appDir: true,
    serverActions: true,
  },
}

module.exports = nextConfig 