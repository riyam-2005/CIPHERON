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
        cipher: {
          bg: '#0B0F17',
          surface: '#161B26',
          card: '#1B2232',
          border: '#232B3E',
          cyan: '#00E5FF',
          amber: '#FFB300',
          red: '#FF3D00',
          green: '#00E676',
          text: '#E0E6ED',
          muted: '#8A99AD'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        oled: ['"VT323"', 'Courier New', 'monospace']
      }
    },
  },
  plugins: [],
}
