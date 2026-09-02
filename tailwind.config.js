/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0B0D0F',
          secondary: '#101316',
          card: '#15191C',
          elevated: '#1D2226',
        },
        crimson: {
          DEFAULT: '#C51F4A',
          dark: '#8F1637',
          deep: '#5C0E23',
          pastel: '#E85A7A',
          glow: '#FF2E63',
          subtle: 'rgba(197, 31, 74, 0.15)',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#A7ADB4',
          muted: '#6C727A',
        },
        border: {
          subtle: '#22272B',
          glow: 'rgba(197, 31, 74, 0.35)',
        },
        rank: {
          bronze: '#CD7F32',
          silver: '#C0C0C0',
          gold: '#FFD700',
          platinum: '#E5E4E2',
          diamond: '#00F0FF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Space Grotesk', 'Rajdhani', 'sans-serif'],
      },
      boxShadow: {
        'crimson-sm': '0 0 10px rgba(197, 31, 74, 0.25)',
        'crimson-md': '0 0 20px rgba(197, 31, 74, 0.35)',
        'crimson-lg': '0 0 35px rgba(197, 31, 74, 0.45)',
        'card': '0 8px 30px rgba(0, 0, 0, 0.5)',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: 0.8, filter: 'drop-shadow(0 0 12px rgba(197, 31, 74, 0.6))' },
          '50%': { opacity: 1, filter: 'drop-shadow(0 0 22px rgba(232, 90, 122, 0.9))' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
        'float': 'float 3.5s ease-in-out infinite',
        'scan': 'scanline 8s linear infinite',
      }
    },
  },
  plugins: [],
}
