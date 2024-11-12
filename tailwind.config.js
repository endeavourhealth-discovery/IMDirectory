/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      zIndex: {
        '1': '1'
      }
    }
  },
  plugins: [require("tailwindcss-primeui")]
};
