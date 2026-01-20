import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // megaSHETH Color Palette
      colors: {
        // Primary palette
        mega: {
          // Molten Orange - Primary accent
          orange: {
            DEFAULT: "#eb4511",
            50: "#fff7ed",
            100: "#ffedd5",
            200: "#fed7aa",
            300: "#fdba74",
            400: "#fb923c",
            500: "#eb4511",
            600: "#d43d0f",
            700: "#b02e0c",
            800: "#8c250a",
            900: "#6b1d08",
          },
          // Deep Saffron - Secondary accent
          saffron: {
            DEFAULT: "#ff9000",
            50: "#fffbeb",
            100: "#fef3c7",
            200: "#fde68a",
            300: "#fcd34d",
            400: "#fbbf24",
            500: "#ff9000",
            600: "#d97706",
            700: "#b45309",
            800: "#92400e",
            900: "#78350f",
          },
          // Oxidized Iron - Deep accent
          iron: {
            DEFAULT: "#b02e0c",
            500: "#b02e0c",
            600: "#991b1b",
            700: "#7f1d1d",
          },
          // Shadow Grey - Background
          shadow: {
            DEFAULT: "#312c2d",
            50: "#494344",
            100: "#413b3c",
            200: "#393334",
            300: "#312c2d",
            400: "#292526",
            500: "#211e1f",
            600: "#191718",
            700: "#111011",
            800: "#0a0909",
            900: "#050505",
          },
          // Alabaster Grey - Text/Light elements
          alabaster: {
            DEFAULT: "#dfdadb",
            50: "#fafafa",
            100: "#f5f5f5",
            200: "#eeecec",
            300: "#e7e4e5",
            400: "#dfdadb",
            500: "#c9c4c5",
            600: "#a8a3a4",
            700: "#878283",
            800: "#666162",
            900: "#454041",
          },
        },
        // Heatmap colors - fire theme
        heat: {
          0: "#1a1617",
          1: "#4a1a0a",
          2: "#8c250a",
          3: "#d43d0f",
          4: "#eb4511",
        },
      },
      // Typography
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "Fira Code",
          "monospace",
        ],
      },
      // Dramatic sizing
      fontSize: {
        "10xl": ["10rem", { lineHeight: "1" }],
        "11xl": ["12rem", { lineHeight: "1" }],
        "12xl": ["14rem", { lineHeight: "1" }],
      },
      // Animations
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "fade-in-up": "fadeInUp 0.5s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 20px rgba(235, 69, 17, 0.2)" },
          "100%": { boxShadow: "0 0 40px rgba(235, 69, 17, 0.4)" },
        },
      },
      // Box shadows
      boxShadow: {
        "mega": "0 4px 60px rgba(235, 69, 17, 0.15)",
        "mega-lg": "0 8px 80px rgba(235, 69, 17, 0.2)",
      },
    },
  },
  plugins: [],
};

export default config;
