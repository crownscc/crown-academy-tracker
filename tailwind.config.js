/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        crown: {
          50: '#fdf8e8',
          100: '#faefc5',
          200: '#f5df8a',
          300: '#efc94b',
          400: '#e8b820',
          500: '#d4a012',
          600: '#a87c0d',
          700: '#7c5a0e',
          800: '#564012',
          900: '#3a2b10',
        },
      },
    },
  },
  plugins: [],
}
