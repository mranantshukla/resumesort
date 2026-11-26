/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // sql.js references Node built-ins that are not needed in the browser build.
    config.resolve.fallback = { ...(config.resolve.fallback || {}), fs: false, path: false, crypto: false };
    return config;
  },
};
export default nextConfig;
