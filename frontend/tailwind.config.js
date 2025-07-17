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
          background: '#0d1117',
          foreground: '#e6edf3',

          card: '#161b22',
          'card-foreground': '#e6edf3',

          popover: '#161b22',
          'popover-foreground': '#e6edf3',

          primary: '#1f6feb',
          'primary-foreground': '#ffffff',

          secondary: '#21262d',
          'secondary-foreground': '#c9d1d9',

          muted: '#21262d',
          'muted-foreground': '#8b949e',

          accent: '#30363d',
          'accent-foreground': '#e6edf3',

          destructive: '#ff6b6b',

          border: '#30363d',
          input: '#30363d',
          ring: '#58a6ff',

          chart: {
            1: '#58a6ff',
            2: '#3fb950',
            3: '#f778ba',
            4: '#d29922',
            5: '#ff7b72',
          },

          sidebar: {
            DEFAULT: '#161b22',
            foreground: '#e6edf3',
            primary: '#1f6feb',
            'primary-foreground': '#ffffff',
            accent: '#21262d',
            'accent-foreground': '#e6edf3',
            border: '#30363d',
            ring: '#58a6ff',
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
