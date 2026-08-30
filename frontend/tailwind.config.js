/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        razorpay: {
          50: '#f0f7ff',
          100: '#e0effe',
          500: '#0c8ce9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c2340',
          dark: '#080c14',
          card: '#0d1527',
          border: '#1a2744'
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}

