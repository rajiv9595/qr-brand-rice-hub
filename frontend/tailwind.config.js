/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Mapping existing semantic names to new design tokens (Reference UI)
        primary: {
          50: '#E8F5E9',
          100: '#C8E6C9',
          200: '#A5D6A7',
          300: '#81C784',
          400: '#66BB6A',
          500: '#2D6A4F', // Field Green
          600: '#245A42',
          700: '#1B4332',
          800: '#143328',
          900: '#0D221A',
          950: '#05110D',
        },
        secondary: {
          50: '#FFF9F0',
          100: '#FFF3E0',
          200: '#FFE0B2',
          300: '#FFCC80',
          400: '#D4A747', // Rice Gold
          500: '#C48B2C',
          600: '#8B6914',
          700: '#6D5210',
          800: '#4A370A',
          900: '#2D1F06',
          950: '#1A1203',
        },
        // Direct reference colors from Reference UI
        rice: {
          50: '#FFF9F0',
          100: '#FFF3E0',
          200: '#FFE0B2',
          300: '#FFCC80',
          400: '#D4A747',
          500: '#C48B2C',
          600: '#8B6914',
          700: '#6D5210',
          800: '#4A370A',
          900: '#2D1F06',
        },
        field: {
          50: '#E8F5E9',
          100: '#C8E6C9',
          200: '#A5D6A7',
          300: '#81C784',
          400: '#66BB6A',
          500: '#2D6A4F',
          600: '#245A42',
          700: '#1B4332',
          800: '#143328',
          900: '#0D221A',
        },
        accent: {
          500: '#D4A747', // Use Rice Gold as accent
          600: '#C48B2C',
        }
      },
      fontFamily: {
        sans: ['Source Sans 3', 'sans-serif'],
        display: ['Playfair Display', 'serif'], // Reference UI Heading Font
        body: ['Source Sans 3', 'sans-serif'], // Reference UI Body Font
      },
      backgroundImage: {
        'hero-pattern': "url('https://images.unsplash.com/photo-1586771107445-d3ca888129ff?q=80&w=2072&auto=format&fit=crop')",
      }
    },
  },
  plugins: [],
}
