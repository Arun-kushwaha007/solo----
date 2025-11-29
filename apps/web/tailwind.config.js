/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        system: {
          black: "#0a0a0a",
          dark: "#111111",
          blue: "#3b82f6",
          lightBlue: "#60a5fa",
          red: "#ef4444",
          text: "#e5e5e5",
          panel: "rgba(10, 10, 10, 0.8)",
        },
      },
      fontFamily: {
        mono: ['"Courier New"', "Courier", "monospace"], // Placeholder for now
        sans: ['"Inter"', "sans-serif"],
      },
      boxShadow: {
        "glow-blue": "0 0 10px rgba(59, 130, 246, 0.5)",
        "glow-red": "0 0 10px rgba(239, 68, 68, 0.5)",
      },
    },
  },
  plugins: [],
};
