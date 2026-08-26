/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        title: 'var(--color-text-title)',
        // Dark mode surface colors mapped to CSS variables
        dark: {
          950: 'var(--color-surface-950)',
          900: 'var(--color-surface-900)',
          850: 'var(--color-surface-850)',
          800: 'var(--color-surface-800)',
          750: 'var(--color-surface-750)',
          700: 'var(--color-surface-700)',
          650: 'var(--color-surface-650)',
          600: 'var(--color-surface-600)',
          500: 'var(--color-surface-500)',
          400: 'var(--color-surface-400)',
          300: 'var(--color-surface-300)',
          200: 'var(--color-surface-200)',
          100: 'var(--color-surface-100)',
        },
        primary: {
          50: '#f3f3ff',
          100: '#ebebff',
          200: '#d8d8ff',
          300: '#bcbafd',
          400: '#a09bfb',
          500: '#8f8af8',
          600: '#7c75f5', // Lighter softer indigo
          700: '#6258e6',
          800: '#4d42cc',
          900: '#3d33a0',
          950: '#221d5c',
        },
        navy: {
          500: '#334155',
          600: '#1e293b',
          700: '#0f172a',
          800: '#020617', // Darkest text
        },
        accent: {
          cyan: '#06b6d4',
          teal: '#0d9488',
          emerald: '#34d399',
          purple: '#a78bfa',
          pink: '#f472b6',
          amber: '#fbbf24',
        },
        civic: {
          cyan: '#06b6d4',
          teal: '#0d9488',
          purple: '#7c3aed',
          green: '#10b981',
          amber: '#f59e0b',
          red: '#ef4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
        'glow': '0 0 20px rgba(6, 182, 212, 0.25)',
        'glow-lg': '0 0 40px rgba(6, 182, 212, 0.2)',
        'glow-cyan': '0 0 20px rgba(34, 211, 238, 0.3)',
        'glow-purple': '0 0 20px rgba(124, 58, 237, 0.3)',
        'inner-glow': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'count-up': 'countUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(6, 182, 212, 0.15)' },
          '50%': { boxShadow: '0 0 40px rgba(6, 182, 212, 0.35)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};
