/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb', // Logo primary blue
          700: '#1d4ed8', // Darker royal blue
          800: '#1e40af', // Deep blue
          900: '#1e3a8a', // Midnight blue
          950: '#0b192c',
        },
        santri: {
          blue: '#2563eb',
          royal: '#1d4ed8',
          navy: '#0f172a',
          darkbg: '#0b132b',
        }
      },
    },
  },
  plugins: [],
};
