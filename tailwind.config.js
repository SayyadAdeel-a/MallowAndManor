/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          black: "#6E4E5C",
          dark: "#8A6A7C",
          gold: "#C08AA5",
          honey: "#D9BEA6",
          pink: "#EFC3D4",
          hotpink: "#C08AA5",
          rose: "#F3D5E1",
          blush: "#F6E7ED",
          purple: "#EDD9C6",
          plum: "#A87E93",
          nude: "#EDD9C6",
          beige: "#F1E7D8",
          light: "#F6E7ED",
          cream: "#F7F3EE",
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
