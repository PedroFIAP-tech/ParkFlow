import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#05070d",
        panel: "#0b1220",
        panel2: "#101b2f",
        line: "rgba(148, 163, 184, 0.18)",
        brand: "#1f6feb",
        electric: "#42a5ff",
        success: "#22c55e",
        warning: "#facc15",
        danger: "#ef4444"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(66, 165, 255, 0.22), 0 24px 80px rgba(0, 0, 0, 0.45)"
      }
    }
  },
  plugins: []
};

export default config;

