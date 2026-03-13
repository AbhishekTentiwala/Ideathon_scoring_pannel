/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'DM Sans'", "sans-serif"],
        display: ["'Syne'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        ink: { DEFAULT: "#0B1120", 50: "#F8F9FA", 100: "#ECEFF5", 200: "#C9D1E1", 300: "#A3AFCA", 400: "#7081A3", 600: "#3D4E75", 800: "#151F33" },
        brand: { DEFAULT: "#003A8C", light: "#E5F0FF", dark: "#002866" },
        accent: { DEFAULT: "#EA700B", light: "#FFEDE0", dark: "#B85500" },
        jade: { DEFAULT: "#22C55E", light: "#F0FDF4" },
        sky: { DEFAULT: "#3B82F6", light: "#EFF6FF" },
        gold: { DEFAULT: "#F59E0B", light: "#FFFBEB" },
        rose: { DEFAULT: "#EF4444", light: "#FEF2F2" },
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.05)",
        float: "0 8px 30px rgba(0,0,0,0.10)",
        brand: "0 4px 20px rgba(0,58,140,0.30)",
        accent: "0 4px 20px rgba(234,112,11,0.30)",
        jade: "0 4px 20px rgba(34,197,94,0.25)",
      },
      keyframes: {
        "fade-up": { "0%": { opacity: "0", transform: "translateY(12px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        "pop": { "0%": { transform: "scale(0.92)", opacity: "0" }, "100%": { transform: "scale(1)", opacity: "1" } },
        "slide-in": { "0%": { transform: "translateX(-10px)", opacity: "0" }, "100%": { transform: "translateX(0)", opacity: "1" } },
        "shimmer": { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        "bounce-sm": { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-3px)" } },
      },
      animation: {
        "fade-up": "fade-up 0.35s ease forwards",
        "fade-in": "fade-in 0.25s ease forwards",
        "pop": "pop 0.3s cubic-bezier(0.175,0.885,0.32,1.275) forwards",
        "slide-in": "slide-in 0.3s ease forwards",
        "shimmer": "shimmer 1.8s linear infinite",
        "bounce-sm": "bounce-sm 1s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
