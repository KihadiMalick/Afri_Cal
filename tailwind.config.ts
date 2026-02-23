import type { Config } from "tailwindcss";

// ============================================================
// AfriCalo — "Africount" Design System
// Palette organique africaine : crème, bois, terracotta, indigo, or
// ============================================================

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ----------------------------------------------------------
      // PALETTE SÉMANTIQUE "AFRICOUNT"
      // ----------------------------------------------------------
      colors: {
        // Fonds crème/parchemin
        "brand-cream":        "#F7F4E8",
        "brand-cream-dark":   "#EDE8D0",
        "brand-cream-deeper": "#D8D0B0",

        // Marrons (texte, bois, contours)
        "brand-brown-dark":   "#4A342E",
        "brand-brown-medium": "#6B4C3B",
        "brand-brown-wood":   "#7C5842",
        "brand-brown-light":  "#A67860",
        "brand-brown-pale":   "#C9A882",

        // Terracotta (couleur principale / CTAs)
        "brand-terracotta":       "#D98E4F",
        "brand-terracotta-dark":  "#B8723A",
        "brand-terracotta-light": "#E8AB72",

        // Indigo (accents motifs, badges)
        "brand-indigo":       "#303F9F",
        "brand-indigo-light": "#5C6BC0",
        "brand-indigo-dark":  "#1A237E",

        // Or (dorures, détails décoratifs)
        "brand-gold":       "#E4C06E",
        "brand-gold-dark":  "#C9A040",
        "brand-gold-light": "#F0D48A",

        // Nuances dark pour compatibilité (ancienne palette mappée sur brun)
        dark: {
          900: "#2A1F1A",
          800: "#3D2B24",
          700: "#4A342E",
          600: "#5C4035",
          500: "#7C5842",
          400: "#A67860",
          300: "#C9A882",
          200: "#DEC5A8",
          100: "#EDE8D0",
        },

        // Primary remappé sur terracotta
        primary: {
          50:  "#FEF3E2",
          100: "#FCE4BF",
          200: "#F9CC88",
          300: "#F5B455",
          400: "#E8AB72",
          500: "#D98E4F",
          600: "#B8723A",
          700: "#96582B",
          800: "#74401E",
          900: "#522C12",
          950: "#3A1C09",
        },

        // Accent remappé sur indigo
        accent: {
          50:  "#E8EAF6",
          100: "#C5CAE9",
          200: "#9FA8DA",
          300: "#7986CB",
          400: "#5C6BC0",
          500: "#303F9F",
          600: "#283593",
          700: "#1A237E",
          800: "#121971",
          900: "#0A1066",
        },
      },

      // ----------------------------------------------------------
      // BORDER RADIUS
      // ----------------------------------------------------------
      borderRadius: {
        card:    "1.25rem",
        "card-sm": "0.875rem",
      },

      // ----------------------------------------------------------
      // BOX SHADOWS — effet tactile réaliste
      // ----------------------------------------------------------
      boxShadow: {
        // Cartes contenu
        card:       "0 2px 16px rgba(74, 52, 46, 0.11), 0 1px 4px rgba(74, 52, 46, 0.07)",
        "card-hover": "0 6px 24px rgba(74, 52, 46, 0.18), 0 2px 8px rgba(74, 52, 46, 0.10)",

        // Bouton SCAN FOOD — au repos (relief prononcé)
        "btn-scan-rest":
          "0 10px 15px -3px rgba(74, 52, 46, 0.40), " +
          "0 4px 6px -2px rgba(74, 52, 46, 0.20), " +
          "inset 0 1px 0 rgba(255, 255, 255, 0.18)",

        // Bouton SCAN FOOD — pressé (s'enfonce)
        "btn-scan-pressed":
          "0 2px 4px -1px rgba(74, 52, 46, 0.40), " +
          "0 1px 2px rgba(74, 52, 46, 0.25), " +
          "inset 0 2px 5px rgba(74, 52, 46, 0.20)",

        // Sidebar item actif — gravé dans le bois
        "sidebar-inset":
          "inset 0 2px 5px rgba(42, 31, 26, 0.55), " +
          "inset 0 1px 2px rgba(42, 31, 26, 0.38), " +
          "0 1px 0 rgba(255, 255, 255, 0.07)",

        // Lueurs colorées
        "glow-terracotta": "0 0 20px rgba(217, 142, 79, 0.30)",
        "glow-gold":       "0 0 20px rgba(228, 192, 110, 0.28)",
        "glow-indigo":     "0 0 20px rgba(48, 63, 159, 0.25)",

        // Focus input
        "input-focus":
          "0 0 0 3px rgba(217, 142, 79, 0.22), " +
          "inset 0 1px 3px rgba(74, 52, 46, 0.09)",
      },

      // ----------------------------------------------------------
      // BACKGROUND IMAGES — patterns SVG inline
      // ----------------------------------------------------------
      backgroundImage: {
        // Veine de bois pour sidebar
        "pattern-wood":
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cline x1='0' y1='0' x2='100' y2='100' stroke='rgba(42,31,26,0.07)' stroke-width='0.5'/%3E%3Cline x1='20' y1='0' x2='120' y2='100' stroke='rgba(42,31,26,0.05)' stroke-width='0.5'/%3E%3Cline x1='40' y1='0' x2='140' y2='100' stroke='rgba(200,160,110,0.06)' stroke-width='0.5'/%3E%3Cline x1='60' y1='0' x2='160' y2='100' stroke='rgba(42,31,26,0.04)' stroke-width='0.5'/%3E%3Cline x1='80' y1='0' x2='180' y2='100' stroke='rgba(200,160,110,0.04)' stroke-width='0.5'/%3E%3C/svg%3E\"), linear-gradient(180deg, #8B6249 0%, #6B4832 50%, #7C5842 100%)",

        // Anneau Adinkra autour du bouton SCAN
        "pattern-adinkra-ring":
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Ccircle cx='30' cy='30' r='12' fill='none' stroke='rgba(228,192,110,0.50)' stroke-width='1.5'/%3E%3Ccircle cx='30' cy='30' r='6' fill='none' stroke='rgba(228,192,110,0.38)' stroke-width='1'/%3E%3Cline x1='30' y1='14' x2='30' y2='18' stroke='rgba(228,192,110,0.50)' stroke-width='1.5'/%3E%3Cline x1='30' y1='42' x2='30' y2='46' stroke='rgba(228,192,110,0.50)' stroke-width='1.5'/%3E%3Cline x1='14' y1='30' x2='18' y2='30' stroke='rgba(228,192,110,0.50)' stroke-width='1.5'/%3E%3Cline x1='42' y1='30' x2='46' y2='30' stroke='rgba(228,192,110,0.50)' stroke-width='1.5'/%3E%3C/svg%3E\")",

        // Grand motif Adinkra en fond (très subtil)
        "pattern-adinkra-bg":
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Ccircle cx='60' cy='60' r='28' fill='none' stroke='rgba(74,52,46,0.05)' stroke-width='2'/%3E%3Ccircle cx='60' cy='60' r='16' fill='none' stroke='rgba(74,52,46,0.04)' stroke-width='1.5'/%3E%3Ccircle cx='60' cy='60' r='6' fill='none' stroke='rgba(74,52,46,0.04)' stroke-width='1'/%3E%3Cline x1='60' y1='28' x2='60' y2='36' stroke='rgba(74,52,46,0.05)' stroke-width='2'/%3E%3Cline x1='60' y1='84' x2='60' y2='92' stroke='rgba(74,52,46,0.05)' stroke-width='2'/%3E%3Cline x1='28' y1='60' x2='36' y2='60' stroke='rgba(74,52,46,0.05)' stroke-width='2'/%3E%3Cline x1='84' y1='60' x2='92' y2='60' stroke='rgba(74,52,46,0.05)' stroke-width='2'/%3E%3Cline x1='39' y1='39' x2='45' y2='45' stroke='rgba(74,52,46,0.03)' stroke-width='1.5'/%3E%3Cline x1='75' y1='75' x2='81' y2='81' stroke='rgba(74,52,46,0.03)' stroke-width='1.5'/%3E%3Cline x1='81' y1='39' x2='75' y2='45' stroke='rgba(74,52,46,0.03)' stroke-width='1.5'/%3E%3Cline x1='39' y1='81' x2='45' y2='75' stroke='rgba(74,52,46,0.03)' stroke-width='1.5'/%3E%3C/svg%3E\")",

        // Dégradés utilitaires
        "gradient-terracotta": "linear-gradient(135deg, #E8AB72 0%, #D98E4F 45%, #B8723A 100%)",
        "gradient-wood":       "linear-gradient(180deg, #8B6249 0%, #6B4832 50%, #7C5842 100%)",
        "gradient-cream":      "linear-gradient(160deg, #F7F4E8 0%, #EDE8D0 100%)",
        "gradient-gold":       "linear-gradient(135deg, #F0D48A 0%, #E4C06E 50%, #C9A040 100%)",
      },

      // ----------------------------------------------------------
      // POLICES — Nunito (corps, chaleureux) + Poppins (titres)
      // ----------------------------------------------------------
      fontFamily: {
        sans:    ["Nunito", "Poppins", "sans-serif"],
        display: ["Poppins", "Nunito", "sans-serif"],
      },

      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },

      // ----------------------------------------------------------
      // ANIMATIONS
      // ----------------------------------------------------------
      animation: {
        "fade-in":       "fadeIn 0.5s ease-out",
        "slide-up":      "slideUp 0.4s ease-out",
        "scale-in":      "scaleIn 0.3s ease-out",
        "slide-in-left": "slideInLeft 0.35s ease-out",
        progress:        "progress 1s ease-out",
        "pulse-warm":    "pulseWarm 2.5s ease-in-out infinite",
        "scan-line":     "scanLine 2s ease-in-out infinite",
        particle:        "particle 2s ease-in-out infinite",
        "spin-slow":     "spin 3s linear infinite",
        "bounce-soft":   "bounceSoft 1s ease-in-out infinite",
      },

      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%":   { opacity: "0", transform: "scale(0.94)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideInLeft: {
          "0%":   { opacity: "0", transform: "translateX(-14px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        progress: {
          "0%": { width: "0%" },
        },
        pulseWarm: {
          "0%, 100%": { boxShadow: "0 0 12px rgba(217, 142, 79, 0.18)" },
          "50%":      { boxShadow: "0 0 30px rgba(217, 142, 79, 0.48)" },
        },
        scanLine: {
          "0%":   { top: "0%" },
          "50%":  { top: "100%" },
          "100%": { top: "0%" },
        },
        particle: {
          "0%":   { top: "100%", opacity: "0" },
          "20%":  { opacity: "0.8" },
          "100%": { top: "0%",   opacity: "0" },
        },
        bounceSoft: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-4px)" },
        },
      },

      // ----------------------------------------------------------
      // MISC
      // ----------------------------------------------------------
      transitionTimingFunction: {
        "bounce-out":    "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "ease-organic":  "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      },
    },
  },
  plugins: [],
};

export default config;
