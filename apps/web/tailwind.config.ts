import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eaf0ec',
          100: '#c4d5cb',
          200: '#9dbaa9',
          300: '#769f87',
          400: '#4f8466',
          500: '#213C2B',
          600: '#1c3325',
          700: '#172a1e',
          800: '#122118',
          900: '#0d1811',
        },
        gold: {
          50:  '#fdf8ef',
          100: '#f9ecd4',
          200: '#f2d9a8',
          300: '#eac67d',
          400: '#C6994C',
          500: '#b8883a',
          600: '#a07630',
        },
        cream: '#F8F7F4',
        body:  '#3D3D3D',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      screens: {
        xs: '375px',
      },
    },
  },
  plugins: [],
};

export default config;
