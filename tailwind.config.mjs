/** @type {import('tailwindcss').Config} */
import daisyui from "daisyui";

export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        bgteam: {
          // Pumpkin
          // 50: '#fff4ed',
          // 100: '#ffe6d5',
          // 200: '#feccaa',
          // 300: '#fdac74',
          // 400: '#fb8a3c',
          // 500: '#f97316',
          // 600: '#ea670c',
          // 700: '#c2570c',
          // 800: '#9a4a12',
          // 900: '#7c3d12',
          // 950: '#432007',

          // Midnight
          50: "#e4f3ff",
          100: "#cfe8ff",
          200: "#a8d3ff",
          300: "#74b4ff",
          400: "#3e82ff",
          500: "#1350ff",
          600: "#003bff",
          700: "#003bff",
          800: "#0035e4",
          900: "#0023b0",
          950: "#000729",
        },
      },
    },
  },
  plugins: [daisyui],
  // daisyui: {
  //     themes: ['night'],
  // },
};
