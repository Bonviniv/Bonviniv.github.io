/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'dark-primary': '#1a1a1a',
        'dark-secondary': '#2d2d2d'
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms')
  ]
};
