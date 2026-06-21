/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1e3a6e',
          50: '#eef2f9',
          100: '#d5e0f0',
          600: '#1e3a6e',
          700: '#183060',
          800: '#122450',
        },
        brand: {
          orange: '#e8640a',
          navy: '#1e3a6e',
        },
      },
    },
  },
  plugins: [],
}
