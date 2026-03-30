/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    `./views/**/*.ejs`, // Update content to include EJS files
  ],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography'), require('daisyui')],
  daisyui: {
    themes: ['fantasy'],
  },
}
