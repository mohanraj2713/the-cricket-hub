/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cricket: {
          green: '#10b981',
          dark: '#047857',
          light: '#34d399',
        }
      }
    },
  },
  plugins: [],
}
