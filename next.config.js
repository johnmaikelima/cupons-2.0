/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  eslint: {
    ignoreDuringBuilds: true, // ignora erros do ESLint
  },
  typescript: {
    ignoreBuildErrors: true, // ignora erros de TypeScript
  },
  images: {
    domains: [
      'www.cartacapital.com.br',
      'www.lomadee.com',
      'lomadee.com'
    ],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': './src',
    };
    return config;
  },
};

module.exports = nextConfig;
