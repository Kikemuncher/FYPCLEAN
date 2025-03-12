/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "tiktok-pink": "#FE2C55",
        "tiktok-blue": "#25F4EE",
        "tiktok-black": "#010101",
        "tiktok-gray": "#F1F1F2",
      },
    },
  },
  plugins: [],
};
