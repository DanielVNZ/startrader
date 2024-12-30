/** @type {import('next').NextConfig} */
const withSvgr = require('next-svgr');

const nextConfig = withSvgr({
  experimental: {
    serverActions: true,
  },
  redirects: async () => {
    return [
      {
        source: "/github",
        destination: "https://github.com/DanielVNZ/startrader",
        permanent: true,
      },
      {
        source: "/deploy",
        destination: "https://vercel.com/templates/next.js/chathn",
        permanent: true,
      },
    ];
  },
  webpack(config) {
    // Add support for importing SVG files as React components
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
});

module.exports = nextConfig;
