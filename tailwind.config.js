/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        'primary-dark': '#4f46e5',
        surface: '#1e1b2e',
        'surface-light': '#2a2740',
        'surface-card': '#252240',
        accent: {
          deep: '#818cf8',
          rem: '#a78bfa',
          light: '#c4b5fd',
        }
      }
    },
  },
  plugins: [],
}
