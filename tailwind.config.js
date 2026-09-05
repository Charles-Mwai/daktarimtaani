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
        canopy: 'var(--color-canopy)',
        leaf: 'var(--color-leaf)',
        murram: 'var(--color-murram)',
        ink: 'var(--color-ink)',
        paper: 'var(--color-paper)',
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        sage: {
          50: '#f6f9f6',
          100: '#edf4ed',
          200: '#d7e6d7',
          300: '#b5d1b6',
          400: '#8db78f',
          500: '#6d9c70',
          600: '#547f57',
          700: '#436546',
          800: '#38523a',
          900: '#2f4431',
        },
        mpesa: {
          DEFAULT: '#00b04f',
          dark: '#008c3e',
          light: '#e6f7ee',
        }
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Inter', 'Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(22, 163, 74, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'card': '0 1px 3px rgba(0,0,0,0.05), 0 10px 15px -5px rgba(22, 163, 74, 0.05)',
        'elevated': '0 20px 25px -5px rgba(0, 0, 0, 0.06), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
};
