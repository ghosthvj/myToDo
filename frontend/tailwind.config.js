/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        priority: {
          low: '#94a3b8',
          medium: '#3b82f6',
          high: '#f97316',
          urgent: '#ef4444',
        },
      },
    },
  },
  plugins: [],
}
