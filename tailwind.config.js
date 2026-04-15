/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      colors: {
        primary: {
          DEFAULT: '#1E3A5F',
          50: '#EEF2F8',
          100: '#D5E0EE',
          200: '#A8BDD9',
          300: '#7A9AC4',
          400: '#4D77AF',
          500: '#2C5282',
          600: '#1E3A5F',
          700: '#162B47',
          800: '#0E1C2F',
          900: '#060E17',
        },
        savings: {
          DEFAULT: '#38A169',
          50: '#F0FBF4',
          100: '#D1F5E0',
          200: '#A3EBC2',
          300: '#74E0A3',
          400: '#46D685',
          500: '#38A169',
          600: '#2D8055',
          700: '#226040',
          800: '#16402B',
          900: '#0B2016',
        },
        navy: {
          DEFAULT: '#1E3A5F',
          light: '#2C5282',
        },
        background: '#F5F7FA',
        surface: '#FFFFFF',
        border: '#E2E8F0',
        'text-primary': '#2D3748',
        'text-muted': '#718096',
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        'sm': '0.375rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 8px 30px rgba(30, 58, 95, 0.12)',
        'modal': '0 20px 60px rgba(30, 58, 95, 0.20)',
        'dropdown': '0 4px 20px rgba(0, 0, 0, 0.10)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};