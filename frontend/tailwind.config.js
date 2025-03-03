/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts,js}'],
  theme: {
    extend: {
      fontFamily: {
        clash: ["ClashDisplay", "sans-serif"],
      },
    },
  },
  plugins: [],
};
