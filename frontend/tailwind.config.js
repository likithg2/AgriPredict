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
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        'text-main': 'var(--text-main)',
        'text-muted': 'var(--text-muted)',
        danger: 'var(--danger)',
        warning: 'var(--warning)',
        success: 'var(--success)',
      }
    },
  },
  plugins: [],
}
