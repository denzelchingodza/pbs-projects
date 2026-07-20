/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        orange: "#E8622D",
        dark: "#231F20",
      },
      fontFamily: {
        // Set once here via a CSS variable that layout.tsx defines using
        // next/font — every `font-sans` in the app (the Tailwind default)
        // now renders as Inter instead of the browser's system font, with
        // no extra network waterfall (next/font self-hosts + preloads it).
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
