/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'hotel': {
          'dark': '#001D39',
          'navy': '#0A4174',
          'teal': '#49769F',
          'cyan': '#4E8EA2',
          'light-cyan': '#6EA2B3',
          'sky': '#7BBDE8',
          'pale-sky': '#BDD8E9',
        },
      },
    },
  },
  plugins: [],
}

