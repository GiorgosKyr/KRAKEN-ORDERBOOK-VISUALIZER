/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'grid-cols-[auto_1fr_auto]',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}