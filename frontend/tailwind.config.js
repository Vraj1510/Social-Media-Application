/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx,html}'],
  theme: {
    extend: {
      backgroundImage: {
        'custom-image':
          "url('/Users/vrajshah1510/Documents/Social-Media-Application/frontend/src/Images/chatwallpaper.jpg_large')",
      },
    },
  },
  plugins: [],
};
