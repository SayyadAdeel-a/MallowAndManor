/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          burgundy: "#4A0E17",
          "wine-dark": "#340910",
          black: "#340910",
          dark: "#340910",
          gold: "#C59B58",
          "gold-light": "#DFC18A",
          honey: "#C59B58",
          rose: "#D495A0",
          pink: "#D495A0",
          hotpink: "#D495A0",
          blush: "#F5E8EB",
          cream: "#FAF7F2",
          border: "#EBDED5",
          purple: "#4A0E17",
          plum: "#4A0E17",
          nude: "#FAF7F2",
          beige: "#FAF7F2",
          light: "#F5E8EB",
        },
      },
      fontFamily: {
        brand: ["Poppins", "sans-serif"],
        display: ["Cormorant Garamond", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
