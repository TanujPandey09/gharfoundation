/**
 * Ghar Foundation — Airbnb Design System (from Open Design)
 * Source of truth: C:\Users\tanuj\.open-design-skill\repo\design-systems\airbnb\DESIGN.md
 *
 * Core Palette:
 * - Rausch Coral-Pink (#FF385C): Primary CTA, search buttons, active tabs, wishlist fill
 * - Deep Rausch (#E00B41): Hover / active state
 * - Canvas White (#FFFFFF): Clean white backgrounds
 * - Soft Cloud (#F7F7F7): Subsurfaces, footer bands, input containers
 * - Hairline Gray (#EBEBEB): 1px dividers and subtle borders
 * - Ink Black (#222222): 90% of text and titles
 * - Ash Gray (#717171): Metadata, secondary labels, icons
 * - Verified Green (#008A05): Aadhaar & Owner verification badges
 */

const airbnbGrays = {
  50: "#FFFFFF",
  100: "#F7F7F7",
  200: "#EBEBEB",
  300: "#DDDDDD",
  400: "#B0B0B0",
  500: "#717171",
  600: "#5E5E5E",
  700: "#484848",
  800: "#333333",
  900: "#222222",
  950: "#111111",
};

const rausch = {
  50: "#FFF5F6",
  100: "#FFF0F2",
  200: "#FFD1D8",
  300: "#FFA8B6",
  400: "#FF6B83",
  500: "#FF385C", // Signature Airbnb Rausch
  600: "#E00B41", // Deep Rausch (hover/active)
  700: "#BA0634",
  800: "#99082D",
  900: "#7F0C29",
  950: "#460212",
  DEFAULT: "#FF385C",
};

const verifiedGreen = {
  50: "#F0FDF4",
  100: "#DCFCE7",
  200: "#BBF7D0",
  300: "#86EFAC",
  400: "#4ADE80",
  500: "#22C55E",
  600: "#008A05", // Airbnb verified green
  700: "#15803D",
  800: "#166534",
  900: "#14532D",
  DEFAULT: "#008A05",
};

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Remap default Tailwind palettes to Airbnb scale
        slate: airbnbGrays,
        gray: airbnbGrays,
        neutral: airbnbGrays,
        mitti: airbnbGrays,
        terracotta: rausch,
        emerald: rausch,
        teal: rausch,

        // Semantic Airbnb Palette
        rausch,
        forest: verifiedGreen,
        verified: verifiedGreen,
        canvas: "#FFFFFF",
        cloud: "#F7F7F7",
        hairline: "#EBEBEB",
        cream: "#FFFFFF", // Canvas white for light themes
        ink: { DEFAULT: "#222222", 2: "#717171", 3: "#B0B0B0" },
        haldi: { DEFAULT: "#E0A526", soft: "#FCF3DC" },
        whatsapp: "#25D366",

        primary: {
          DEFAULT: "#FF385C",
          hover: "#E00B41",
          soft: "#FFF0F2",
          50: "#FFF5F6",
          100: "#FFF0F2",
          200: "#FFD1D8",
          300: "#FFA8B6",
          400: "#FF6B83",
          500: "#FF385C",
          600: "#E00B41",
          700: "#BA0634",
          800: "#99082D",
          900: "#7F0C29",
        },
        secondary: {
          DEFAULT: "#222222",
          hover: "#000000",
          50: "#F7F7F7",
          100: "#EBEBEB",
          200: "#DDDDDD",
          300: "#B0B0B0",
          400: "#717171",
          500: "#484848",
          600: "#222222",
          700: "#1A1A1A",
          800: "#111111",
          900: "#000000",
        },
        accent: {
          DEFAULT: "#FF385C",
          hover: "#E00B41",
        },
        success: "#008A05",
        warning: "#E0A526",
        error: "#C13515",
        info: "#428BFF",
        background: "#FFFFFF",
        surface: "#FFFFFF",
        darkBackground: "#121212",
        textPrimary: "#222222",
        textSecondary: "#717171",
        border: "#EBEBEB",
        divider: "#EBEBEB",
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "-apple-system", "BlinkMacSystemFont", "Roboto", "sans-serif"],
        display: ["var(--font-bricolage)", "var(--font-jakarta)", "sans-serif"],
        cereal: ["var(--font-jakarta)", "sans-serif"],
      },
      borderRadius: {
        btn: "10px",
        card: "16px",
        dialog: "24px",
        input: "8px",
        img: "16px",
        pill: "9999px",
      },
      boxShadow: {
        e1: "0 1px 2px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05)",
        e2: "0 6px 16px rgba(0, 0, 0, 0.12)",
        e3: "0 12px 28px rgba(0, 0, 0, 0.15)",
        airbnb: "0 3px 12px rgba(0, 0, 0, 0.08)",
        airbnbHover: "0 6px 20px rgba(0, 0, 0, 0.12)",
        pill: "0 1px 2px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05)",
        premium: "0 6px 16px rgba(0, 0, 0, 0.08)",
        premiumDark: "0 6px 16px rgba(0, 0, 0, 0.4)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.06)",
      },
      transitionTimingFunction: {
        ghar: "cubic-bezier(0.2, 0, 0, 1)",
      },
      zIndex: {
        sticky: "10",
        nav: "20",
        dropdown: "30",
        modal: "40",
        toast: "50",
      },
    },
  },
  plugins: [],
};

module.exports = config;

