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
        theme: {
          primary: "#3b82f6",
          secondary: "#60a5fa",
          bg: "#0a0a0a",
          surface: "#111111",
          accent: "#ef4444",
          text: "#e5e5e5",
          muted: "#a1a1aa",
          success: "#10b981",
          warning: "#f59e0b",
          error: "#ef4444",
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', "monospace"],
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
