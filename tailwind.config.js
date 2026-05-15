/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-navy': '#0f4c81',
        'brand-teal': '#00897b',
        'zone-red':   '#ef4444',
        'zone-amber': '#f59e0b',
        'zone-green': '#22c55e',
        'zone-blue':  '#3b82f6',
        'surface':    '#f8fafc',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
