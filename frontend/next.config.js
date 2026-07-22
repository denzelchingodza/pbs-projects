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
  // The backend (FastAPI) always runs on the same machine as this Next.js
  // server, on port 8000. Proxying /api and /static through this server
  // means the browser only ever talks to whatever host it already loaded
  // the page from (localhost on the computer, the Mac's network address on
  // a phone), and this server forwards the request to the backend over
  // localhost itself, which is always correct regardless of which device is
  // actually browsing. This is what makes photos, video, and API calls work
  // the same way whether the site is opened on the computer or a phone.
  //
  // FastAPI's own routes are registered with a trailing slash (e.g.
  // "/api/gallery/"), by default Next.js redirects any incoming request
  // that ends in a slash to the same path without one, before it even gets
  // to the rewrite above. That collided with FastAPI's own opposite rule
  // (it redirects the no-slash version back to the slash version, using
  // its own internal address in that redirect), which would send a phone's
  // browser toward "127.0.0.1:8000", which on a phone means the phone
  // itself. skipTrailingSlashRedirect turns off Next's side of that so the
  // request the frontend actually made reaches the backend unchanged.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      { source: "/api/:path*", destination: "http://127.0.0.1:8000/api/:path*" },
      { source: "/static/:path*", destination: "http://127.0.0.1:8000/static/:path*" },
    ];
  },
};

module.exports = withPWA(nextConfig);
