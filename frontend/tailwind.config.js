/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        'auth-bg': "url('/background.png')",
      },
    },
  },
  plugins: [],
}

