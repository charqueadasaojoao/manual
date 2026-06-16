/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        marinho: {
          DEFAULT: "#012d5c",
          suave: "#0a3f78",
        },
        papel: {
          DEFAULT: "#f0ebe8",
          sel: "#e3dcd6",
        },
        kraft: {
          DEFAULT: "#9a8f86",
          claro: "#d8d0c8",
        },
        dourado: "#b08d3e",
        pasto: "#4a6b5c",
      },
      fontFamily: {
        display: ["Cinzel", "Georgia", "serif"],
        corpo: ["Questrial", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
