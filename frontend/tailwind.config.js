/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,css}"],
  theme: {
    extend: {
      colors: {
        primary: "#006470",
        "primary-light": "#2D7D8A",
        "primary-dark": "#004E59",
        "primary-accent": "#A4EEFD",
        background: "#F7F9FF",
        surface: "#FFFFFF",
        "surface-muted": "#ECF4FF",
        "surface-dark": "#26323D",
        "soft-teal": "#E9F2F3",
        "on-surface": "#111D27",
        "on-surface-muted": "#3F484A",
        "on-surface-subtle": "#6F797B",
        "on-primary": "#FFFFFF",
        "on-dark-accent": "#A4EEFD",
        outline: "#6F797B",
        "outline-muted": "#BEC8CA",
        "accent-gold": "#E79D19",
        "strathmore-blue": "#02338D",
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
        crisis: "#CC0000",
        "crisis-light": "#FFDAD4",
      },
      fontFamily: {
        heading: ["Plus Jakarta Sans", "sans-serif"],
        body: ["Work Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};
