import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'crypto-dark': '#0a0e1a',
        'crypto-card': '#131824',
        'crypto-border': '#1f2937',
        'crypto-green': '#00d09c',
        'crypto-red': '#f6465d',
        'crypto-yellow': '#f0b90b',
      },
      fontFamily: {
        'mono': ['Roboto Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config