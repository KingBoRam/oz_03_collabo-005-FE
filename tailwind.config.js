/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    './index.html',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      keyframes: {
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(30%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        slideInLeft: 'slideInLeft 0.7s ease-in-out',
        slideInRight: 'slideInRight 0.7s ease-in-out',
      },

      screens: {
        xs: { max: '600px' },
        xxs: { max: '375px' },
      },
      colors: {
        primary: '#f56e26',
        black: '#000000',
        red: '#FF3B30',
        gray: {
          78: '#787486',
          '9f': '#9FA6B2',
          d9: '#D9D9D9',
          ee: '#EEEEEE',
          fa: '#FAFAFA',
          98: '#989898',
          66: '#666666',
        },
      },
    },
  },
  plugins: [require('tailwind-scrollbar-hide')],
};
