import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'pesia-green': 'rgb(46 139 87)',
        'pesia-dark-blue': '#1a365d',
        'pesia-light-green': '#90EE90',
        'pesia-orange': '#FFA500',
      },
    },
  },
  plugins: [],
}

export default config 