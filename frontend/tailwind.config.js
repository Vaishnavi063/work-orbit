/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin');
const tailwindcssAnimate = require('tailwindcss-animate');
const tailwindcssTypography = require('@tailwindcss/typography');

module.exports = {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'oklch(var(--background))',
        foreground: 'oklch(var(--foreground))',
        card: 'oklch(var(--card))',
        'card-foreground': 'oklch(var(--card-foreground))',
        popover: 'oklch(var(--popover))',
        'popover-foreground': 'oklch(var(--popover-foreground))',
        primary: 'oklch(var(--primary))',
        'primary-foreground': 'oklch(var(--primary-foreground))',
        secondary: 'oklch(var(--secondary))',
        'secondary-foreground': 'oklch(var(--secondary-foreground))',
        muted: 'oklch(var(--muted))',
        'muted-foreground': 'oklch(var(--muted-foreground))',
        accent: 'oklch(var(--accent))',
        'accent-foreground': 'oklch(var(--accent-foreground))',
        destructive: 'oklch(var(--destructive))',
        border: 'oklch(var(--border))',
        input: 'oklch(var(--input))',
        ring: 'oklch(var(--ring))',
        chart: {
          1: 'oklch(var(--chart-1))',
          2: 'oklch(var(--chart-2))',
          3: 'oklch(var(--chart-3))',
          4: 'oklch(var(--chart-4))',
          5: 'oklch(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'oklch(var(--sidebar))',
          foreground: 'oklch(var(--sidebar-foreground))',
          primary: 'oklch(var(--sidebar-primary))',
          'primary-foreground': 'oklch(var(--sidebar-primary-foreground))',
          accent: 'oklch(var(--sidebar-accent))',
          'accent-foreground': 'oklch(var(--sidebar-accent-foreground))',
          border: 'oklch(var(--sidebar-border))',
          ring: 'oklch(var(--sidebar-ring))',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        serif: ['var(--font-serif)'],
        mono: ['var(--font-mono)'],
      },
      boxShadow: {
        '2xs': 'var(--shadow-2xs)',
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [
    tailwindcssAnimate,
    tailwindcssTypography,
    plugin(function ({ addBase }) {
      addBase({
        ':root': {
          '--radius-sm': 'calc(var(--radius) - 4px)',
          '--radius-md': 'calc(var(--radius) - 2px)',
          '--radius-lg': 'var(--radius)',
          '--radius-xl': 'calc(var(--radius) + 4px)',
        },
      });
    }),
  ],
};
