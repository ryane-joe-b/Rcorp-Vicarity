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
          400: '#8A9A5B',  // Updated to spec: #8A9A5B
          500: '#6f8a77',
          600: '#61703c',  // Success state
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
          400: '#E2725B',  // Updated to spec: #E2725B
          500: '#c96228',
          600: '#c45038',  // Warning state
          700: '#96441a',
          800: '#7a391b',
          900: '#643119',
        },
        // Ocean Blue (Accent - Trust/Professional)
        ocean: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#b9dffc',
          300: '#7cc5fa',
          400: '#36a8f5',
          500: '#2E4E6D',  // Updated to spec: #2E4E6D
          600: '#006fc4',
          700: '#233751',  // Error state
          800: '#064a83',
          900: '#0b3e6d',
        },
        // Neutral Colors
        background: '#F5F3F0',  // Warm gray background
        charcoal: '#2C3E3E',    // Text color for maximum readability
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      fontSize: {
        // Mobile-first typography scale
        'h1-mobile': ['2rem', { lineHeight: '1.2', fontWeight: '700' }],
        'h1-desktop': ['3rem', { lineHeight: '1.1', fontWeight: '700' }],
        'h2-mobile': ['1.75rem', { lineHeight: '1.3', fontWeight: '600' }],
        'h2-desktop': ['2.25rem', { lineHeight: '1.2', fontWeight: '600' }],
        'h3-mobile': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
        'h3-desktop': ['1.875rem', { lineHeight: '1.3', fontWeight: '600' }],
        'body-mobile': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-desktop': ['1.125rem', { lineHeight: '1.6', fontWeight: '400' }],
        'small': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 10px 40px -10px rgba(0, 0, 0, 0.1)',
        'healthcare': '0 4px 20px -4px rgba(138, 154, 91, 0.15)',
        'trust': '0 8px 30px -6px rgba(46, 78, 109, 0.2)',
      },
      spacing: {
        // Touch-optimized spacing (44px minimum)
        'touch': '2.75rem', // 44px
        'touch-lg': '3.5rem', // 56px
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'counter': 'counter 2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        counter: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      screens: {
        'xs': '475px',
      },
    },
  },
  plugins: [],
}
