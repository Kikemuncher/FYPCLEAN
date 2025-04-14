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
      // Add animation keyframes and class
      keyframes: {
        'like-pop': {
          '0%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.4)', opacity: '0.9' }, // Scale up
          '100%': { transform: 'scale(1.2)', opacity: '0' }, // Scale down slightly and fade out
        }
      },
      animation: {
        'like-pop': 'like-pop 0.8s ease-out forwards', // Adjust duration and timing
        'spin-slow': 'spin 8s linear infinite', // Added for rotating sound icon
      }
    },
  },
  plugins: [
    // require('@tailwindcss/line-clamp'), // Removed as it's included by default in Tailwind v3.3+
  ],
};
