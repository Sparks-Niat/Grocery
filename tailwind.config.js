/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E3F20', // Deep Forest Green
          dark: '#142B15',
          light: '#2E5F31',
        },
        secondary: {
          DEFAULT: '#3B7A57', // Fresh Green
          dark: '#2A583E',
          light: '#4C9C6F',
        },
        accent: {
          DEFAULT: '#FF9F1C', // Warm Orange/Yellow
          dark: '#E68A00',
          light: '#FFB84D',
        },
        cream: {
          DEFAULT: '#FDFBF7', // Warm Cream / Ivory
          dark: '#F5F2EB',
          light: '#FFFFFD',
        },
        charcoal: {
          DEFAULT: '#222522', // Dark Charcoal
          dark: '#111311',
          light: '#3C403C',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
