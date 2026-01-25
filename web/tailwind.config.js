/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Sage (Primary - Care Workers)
        sage: {
          50: '#f6f8f6',
          100: '#e8ede9',
          200: '#d1dbd3',
          300: '#aec0b2',
          400: '#86a890',  // Main sage
          500: '#6f8a77',
          600: '#5a6f60',
          700: '#4a5a4f',
          800: '#3d4a41',
          900: '#333d37',
        },
        // Terracotta (Secondary - Care Homes)
        terracotta: {
          50: '#fef6f2',
          100: '#fce9de',
          200: '#f9d0bd',
          300: '#f5ad8f',
          400: '#ef7f59',
          500: '#c96228',  // Main terracotta
          600: '#b4531f',
          700: '#96441a',
          800: '#7a391b',
          900: '#643119',
        },
        // Blue (Accent - Trust/Professional)
        ocean: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#b9dffc',
          300: '#7cc5fa',
          400: '#36a8f5',
          500: '#0c8ce6',
          600: '#006fc4',  // Main blue
          700: '#01579f',
          800: '#064a83',
          900: '#0b3e6d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 10px 40px -10px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}
