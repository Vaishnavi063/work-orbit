import tailwindcssAnimate from "tailwindcss-animate";
import tailwindcssTypography from "@tailwindcss/typography";

module.exports = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Montserrat"', 'sans-serif'],
        serif: ['"Geist"', 'serif'],
        mono: ['"Azeret Mono"', 'monospace'],
      },
      colors: {
        background: '#ffffff',
        foreground: '#09090b',
        card: '#ffffff',
        'card-foreground': '#09090b',
        popover: '#ffffff',
        'popover-foreground': '#09090b',
        primary: '#18181b',
        'primary-foreground': '#fafafa',
        secondary: '#f4f4f5',
        'secondary-foreground': '#18181b',
        muted: '#f4f4f5',
        'muted-foreground': '#71717b',
        accent: '#f4f4f5',
        'accent-foreground': '#18181b',
        destructive: '#e7000b',
        border: '#e4e4e7',
        input: '#e4e4e7',
        ring: '#9f9fa9',
        chart: {
          1: '#f54900',
          2: '#009689',
          3: '#104e64',
          4: '#ffb900',
          5: '#fe9a00',
        },
        sidebar: {
          DEFAULT: '#fafafa',
          foreground: '#09090b',
          primary: '#18181b',
          'primary-foreground': '#fafafa',
          accent: '#f4f4f5',
          'accent-foreground': '#18181b',
          border: '#e4e4e7',
          ring: '#9f9fa9',
        },

        // Dark mode values
        dark: {
          background: '#09090b',
          foreground: '#fafafa',
          card: '#18181b',
          'card-foreground': '#fafafa',
          popover: '#18181b',
          'popover-foreground': '#fafafa',
          primary: '#e4e4e7',
          'primary-foreground': '#18181b',
          secondary: '#27272a',
          'secondary-foreground': '#fafafa',
          muted: '#27272a',
          'muted-foreground': '#9f9fa9',
          accent: '#27272a',
          'accent-foreground': '#fafafa',
          destructive: '#ff6467',
          border: '#ffffff1a',
          input: '#ffffff26',
          ring: '#71717b',
          chart: {
            1: '#1447e6',
            2: '#00bc7d',
            3: '#fe9a00',
            4: '#ad46ff',
            5: '#ff2056',
          },
          sidebar: {
            DEFAULT: '#18181b',
            foreground: '#fafafa',
            primary: '#1447e6',
            'primary-foreground': '#fafafa',
            accent: '#27272a',
            'accent-foreground': '#fafafa',
            border: '#ffffff1a',
            ring: '#71717b',
          },
        },
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
    tailwindcssTypography
  ],
};
