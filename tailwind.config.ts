import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brainBlue: "#3366fe",
        ink: "#0b1022",
        card: "#ffffff",
        soft: "#f5f7ff",
      },
      boxShadow: {
        soft: "0 6px 22px rgba(0,0,0,0.06)",
      },
      borderRadius: {
        xl2: "1rem",
      },
    },
  },
  plugins: [],
};
export default config;
