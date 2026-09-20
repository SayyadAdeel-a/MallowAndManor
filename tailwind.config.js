/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          black: "#38070F",
          dark: "#581420",
          burgundy: "#4A0E17",
          wine: "#340910",
          gold: "#C59B58",
          "gold-light": "#DFC18A",
          honey: "#D8AF6E",
          pink: "#E2ACB4",
          hotpink: "#C59B58",
          rose: "#D495A0",
          blush: "#F7ECEE",
          purple: "#EADDCF",
          plum: "#7A2837",
          nude: "#EADDCF",
          beige: "#F3ECE2",
          light: "#F7ECEE",
          border: "#EBDED5",
          cream: "#FAF7F2",
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
