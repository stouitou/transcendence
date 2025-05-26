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
  safelist: [
    'game-container',
    'ui',
    'canvas',
    'alert',
    'gameHero',
    'player-score',
    'score-cell',
    'score-cell.score-cell-points',
    'alert.show',
  ],
};
