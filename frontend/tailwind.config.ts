import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: "#6366F1",
        "brand-dark": "#5659E8",
        "brand-soft": "#E6E7FD",
        success: "#22C55E",
        danger: "#EF4444",
        warning: "#F59E0B",
        favorite: "#F6C453",
        page: "#F5F5F5",
        surface: "#FFFFFF",
        muted: "#F3F4F6",
        border: "#E5E7EB",
        "text-main": "#4B5563",
        "text-muted": "#9CA3AF"
      },
      boxShadow: {
        panel: "0 24px 48px rgba(15, 23, 42, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
