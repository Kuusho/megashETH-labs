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
        // ── New palette ─────────────────────────────────
        // Background / surface family (Midnight Violet)
        bg: {
          DEFAULT: "#3b252c",
          surface: "#2d1b22",
          raised: "#3f2830",
        },
        // Text family
        beige: {
          DEFAULT: "#f5f8de",
          muted: "#aea4bf",
          dim: "#8f6593",
        },
        // Accent (Light Green)
        accent: {
          DEFAULT: "#84e296",
          hover: "#6dd485",
          dim: "rgba(132, 226, 150, 0.12)",
        },
        // Named midtones for direct use
        lilac: "#aea4bf",
        lavender: "#8f6593",
        // Border utility
        border: {
          DEFAULT: "rgba(174, 164, 191, 0.15)",
          strong: "rgba(174, 164, 191, 0.3)",
        },

        // ── Heatmap ramps ────────────────────────────────
        heat: {
          // violet (default — palette-native)
          "violet-0": "#3b252c",
          "violet-1": "#5e3c4a",
          "violet-2": "#8f6593",
          "violet-3": "#aea4bf",
          "violet-4": "#84e296",
          // fire
          "fire-0": "#2d1b22",
          "fire-1": "#4a1a0a",
          "fire-2": "#8c250a",
          "fire-3": "#d43d0f",
          "fire-4": "#eb4511",
          // ocean
          "ocean-0": "#2d1b22",
          "ocean-1": "#0A3069",
          "ocean-2": "#0969DA",
          "ocean-3": "#54AEFF",
          "ocean-4": "#80CCFF",
          // forest
          "forest-0": "#2d1b22",
          "forest-1": "#0E4429",
          "forest-2": "#006D32",
          "forest-3": "#26A641",
          "forest-4": "#39D353",
        },

        // ── Semantic status ──────────────────────────────
        error: "#ff7b7b",
        warning: "#e8c37a",
      },

      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },

      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "fade-in-up": "fadeInUp 0.4s ease-out",
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
      },

      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.5), 0 0 0 1px rgba(174,164,191,0.08)",
        "accent-glow": "0 0 24px rgba(132,226,150,0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
