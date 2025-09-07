// FILE: next.config.mjs
const nextConfig = {
  reactStrictMode: true,
  experimental: { serverActions: true },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://wecoinvisors.onrender.com/api/:path*", // backend URL
      },
    ];
  },
};
export default nextConfig;
