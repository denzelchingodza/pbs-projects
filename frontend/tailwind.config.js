/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        orange: "#E8622D",
        dark: "#231F20",
        // A warm off-white instead of flat #ffffff for section backgrounds
        // (see Stage 50 in BUILD_LOG.md), pure white was reading as blank,
        // undifferentiated space. Cards, buttons, and other real surfaces
        // still use plain white, so they visibly lift off this warmer base
        // instead of disappearing flush into it.
        paper: "#F7F2E9",
      },
      fontFamily: {
        // Set once here via CSS variables that layout.tsx defines using
        // next/font — every `font-sans` in the app (the Tailwind default)
        // now renders as Inter instead of the browser's system font, with
        // no extra network waterfall (next/font self-hosts + preloads it).
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        // Every heading site-wide uses this (see globals.css's `h1-h4`
        // rule), Space Grotesk instead of Inter for headings only, real
        // typographic contrast instead of one typeface used for
        // everything, which read as generic. Also available directly as
        // `font-display` for non-heading elements that should match (the
        // logo wordmark, Stats' big numbers).
        display: ["var(--font-space-grotesk)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
