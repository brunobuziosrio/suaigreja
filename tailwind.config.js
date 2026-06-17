/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sand: "var(--color-sand)",
        ocean: "var(--color-ocean)",
        forest: "var(--color-forest)",
        amber: "var(--color-amber)",
        gold: "var(--color-gold)",
      },
    },
  },
  plugins: [],
  safelist: [
    // Select/Dropdown colors
    { pattern: /^bg-(white|gray-50|gray-100|gray-200)$/ },
    { pattern: /^text-(gray-900|gray-800|gray-700)$/ },
    { pattern: /^border-(gray-300|gray-400)$/ },
    { pattern: /^shadow-/ },
    // Ensure all state variants work
    { pattern: /^(data|focus|hover):/ },
  ],
}
