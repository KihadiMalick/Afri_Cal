import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: "#111114",
          800: "#1a1a1f",
          700: "#222228",
          600: "#2a2a32",
          500: "#35353f",
          400: "#44444f",
          300: "#5a5a66",
          200: "#7a7a88",
          100: "#9a9aaa",
        },
        primary: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          950: "#022c22",
        },
        accent: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
      },
      borderRadius: {
        card: "1rem",
      },
      boxShadow: {
        card: "0 2px 12px rgba(0, 0, 0, 0.25)",
        "card-hover": "0 4px 20px rgba(0, 0, 0, 0.35)",
        glow: "0 0 20px rgba(16, 185, 129, 0.15)",
        "glow-accent": "0 0 20px rgba(251, 191, 36, 0.15)",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        progress: "progress 1s ease-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "scan-line": "scanLine 2s ease-in-out infinite",
        particle: "particle 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        progress: {
          "0%": { width: "0%" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 10px rgba(16, 185, 129, 0.1)" },
          "50%": { boxShadow: "0 0 20px rgba(16, 185, 129, 0.25)" },
        },
        scanLine: {
          "0%": { top: "0%" },
          "50%": { top: "100%" },
          "100%": { top: "0%" },
        },
        particle: {
          "0%": { top: "100%", opacity: "0" },
          "20%": { opacity: "0.8" },
          "100%": { top: "0%", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
