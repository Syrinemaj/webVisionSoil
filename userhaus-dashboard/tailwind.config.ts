import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
		input: "#000000", // Champs de saisie noirs
        ring: "#000000", // Anneaux de focus en noir
  /** 🎨 Couleurs principales **/
  background: "#FFFFFF",
  foreground: "#000000", // Texte par défaut en noir

  /** ✅ Titres en noir **/
  title: "#000000",

  primary: {
	DEFAULT: "#678B25", // Vert principal
	hover: "#56771F", // Vert foncé au survol
	foreground: "#FFFFFF", // Texte blanc sur boutons verts
  },
  secondary: {
	DEFAULT: "#FFFFFF", // Blanc pour boutons et fonds
	hover: "#F0F0F0", // Gris très clair au survol
	foreground: "#000000", // Texte noir pour contraste
  },
  accent: {
	DEFAULT: "#F5F5F5", // Gris clair
	foreground: "#000000",
  },

  destructive: {
	DEFAULT: "#DC2626", // Rouge pour actions dangereuses
	foreground: "#FFFFFF",
  },
  muted: {
	DEFAULT: "#E5E5E5",
	foreground: "#000000",
  },

  popover: {
	DEFAULT: "#FFFFFF",
	foreground: "#000000",
  },
  card: {
	DEFAULT: "hsl(var(--card))",
	foreground: "hsl(var(--card-foreground))",
  },
  soil: {
	100: "#E6F4EA",
	200: "#CEEAD6",
	300: "#A8DAB5",
	400: "#81C995",
	500: "#5BB974",
	600: "#34A853",
	700: "#2D923F",
	800: "#267C2B",
	900: "#1E6623",
  },
        /** 🎨 Sidebar avec des nuances de vert **/
        sidebar: {
          DEFAULT: "#F5F5F5",
          foreground: "#678B25",
          primary: "#678B25",
          "primary-foreground": "#FFFFFF",
          accent: "#E5E5E5",
          "accent-foreground": "#678B25",
          border: "#D4D4D4",
          ring: "#678B25",
        },
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
	  
      typography: (theme) => ({
        DEFAULT: {
          css: {
            h1: { color: theme("colors.title") },
            h2: { color: theme("colors.title") },
            h3: { color: theme("colors.title") },
            h4: { color: theme("colors.title") },
          },
        },
      }),

      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },

      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config; 