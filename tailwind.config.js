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
        // Add custom colors to match agent-monitor
        primary: {
          DEFAULT: '#3B82F6', // blue-500
          dark: '#2563EB',    // blue-600
        },
        secondary: {
          DEFAULT: '#6B7280', // gray-500
          dark: '#4B5563',    // gray-600
        },
      },
    },
  },
  plugins: [],
}
