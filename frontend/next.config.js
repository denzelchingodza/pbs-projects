/** Wraps the Next.js config with PWA support (offline caching, installability). */
const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" }, // placeholder hero photo only — remove once real photos are in
    ],
  },
};

module.exports = withPWA(nextConfig);
