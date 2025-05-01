/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'www.lomadee.com',
      'www.google.com',
      'www.cartacapital.com.br'
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
