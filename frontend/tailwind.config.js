/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: { extend: {
    colors: Object.fromEntries(["page", "sheet", "rail", "ink", "muted", "rule", "accent", "accent-soft", "high", "medium", "low"].map(token => [token, `var(--${token})`])),
    fontFamily: { sans: ["Barlow", "system-ui", "sans-serif"], heading: ["Barlow Condensed", "Arial Narrow", "sans-serif"], mono: ["JetBrains Mono", "Consolas", "monospace"] },
  } },
  plugins: [],
};
