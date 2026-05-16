/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Scan all JS/TS files in src for class usage
  ],
  theme: {
    extend: {
      // === Custom Colors ===
      colors: {
        // Primary brand colors
        primary: {
          DEFAULT: '#003f7f', // Main dark blue
          dark: '#002a5a',    // Darker shade
          light: '#0055aa'    // Lighter shade
        },
        // Accent colors for each role
        accent: {
          student: '#FFD700', // Yellow for Student
          lecturer: '#0000FF', // Blue for Lecturer
          admin: '#00FF00'    // Green for Admin
        },
        // Neutral palette
        neutral: {
          white: '#ffffff',
          gray: '#f0f0f0',
          dark: '#333333'
        }
      },
      // === Font Family ===
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'], // Main UI font
      },
      // === Custom Spacing ===
      spacing: {
        '18': '4.5rem', // Custom spacing for layout
        '88': '22rem',  // Custom spacing for layout
      }
    },
  },
  plugins: [], // Add Tailwind plugins here if needed
} 