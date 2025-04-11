/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts,js}'],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        archivo: ['"Archivo Black"', 'sans-serif'],
      },
      colors: {
        custom: '#60a5fa', // Ajoutez votre couleur personnalisée ici
      },
    },
  },
  plugins: [],
};
