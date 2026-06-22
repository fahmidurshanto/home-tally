/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary:   '#1E3A5F',
        income:    '#1A7A4A',
        expense:   '#8B1A1A',
        bg:        '#F4F6F8',
        card:      '#FFFFFF',
        textMain:  '#1A1A1A',
        textSub:   '#666666',
        border:    '#E0E0E0',
      },
    },
  },
  plugins: [],
};
