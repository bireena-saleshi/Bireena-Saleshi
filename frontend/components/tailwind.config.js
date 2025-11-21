/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom neon palette from Image B
        neon: {
          purple: {
            DEFAULT: '#7c3aed',
            dark: '#6d28d9',
            light: '#9333ea',
          },
          pink: {
            DEFAULT: '#ec4899',
            light: '#f472b6',
          },
          cyan: {
            DEFAULT: '#06b6d4',
            light: '#22d3ee',
          },
        },
        dark: {
          bg: '#0f0318',
          alt: '#1a0b2e',
          card: 'rgba(30, 15, 50, 0.7)',
        },
      },
      fontFamily: {
        heading: ['Playfair Display', 'serif'],
        body: ['Poppins', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-neon': 'linear-gradient(135deg, #06b6d4 0%, #7c3aed 100%)',
        'gradient-neon-pink': 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
        'gradient-hero': 'linear-gradient(135deg, #0f0318 0%, #1a0b2e 50%, #2d1b4e 100%)',
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(6, 182, 212, 0.5)',
        'neon-purple': '0 0 30px rgba(124, 58, 237, 0.4)',
        'neon-pink': '0 0 25px rgba(236, 72, 153, 0.4)',
        'card-glow': '0 8px 32px rgba(124, 58, 237, 0.2), 0 0 60px rgba(236, 72, 153, 0.15)',
      },
      backdropBlur: {
        'glass': '20px',
      },
      borderRadius: {
        'card': '32px',
        'button': '50px',
      },
      animation: {
        'gradient-shift': 'gradient-shift 3s ease-in-out infinite',
        'particle-float': 'particle-float 20s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'particle-float': {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(30px, -30px)' },
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
};
