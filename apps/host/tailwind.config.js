const { title } = require('process')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      screens: {
        'pc': '1280px',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        title: 'var(--text-primary)',
        rise: 'var(--rise)',
        link: 'var(--link)',
        fall: 'var(--fall)',
        fall: 'var(--fall)',
        'rise-opacity-10': 'var(--rise-opacity-10)',
        'fall-opacity-10': 'var(--fall-opacity-10)',
        'desktop-rise': 'var(--desktop-rise)',
        'desktop-fall': 'var(--desktop-fall)',
        reduce: 'var(--reduce)',
        impartal: 'var(--impartal)',
        neutral: 'var(--neutral)',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        tertiary: {
          DEFAULT: 'var(--tertiary)',
          foreground: 'var(--tertiary)',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
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
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.25s ease-out',
        'accordion-up': 'accordion-up 0.25s ease-out',
        'fade-in': 'fade-in 0.6s ease-in',
      },
      backgroundImage: {
        'qr-gradient': 'linear-gradient(90deg, rgba(165,62,255,0.5) 20%, rgba(0,247,165,0.5) 100%)',
        'qr-gradient-p3':
        'linear-gradient(90deg, color(display-p3 0.600 0.271 1.000 / 0.5) 20%, color(display-p3 0.000 0.953 0.671 / 0.5) 100%)',
        'x-gradient-active': 'linear-gradient(90deg, #6A2AE0, #6A2AE0)',
        'x-gradient': 'linear-gradient(47.78deg, #9C2CFF 2.71%, #FF5EFF 93.06%)',
        'x-gradient-button': 'purple-btn-gradient',
      },
      boxShadow: {
        'inset-green': 'inset 0px 2.5px 0px -1px rgba(95, 207, 124, 1), inset 0px -2.5px 0px 0px rgba(0, 130, 69, 1)',
        'inset-red': 'inset 0px 2.5px 0px -1px rgba(255, 93, 101, 1), inset 0px -2.5px 0px 0px rgba(177, 35, 56, 1)',
        'multi-red':
          '0px 2px 4px 0px rgba(0, 0, 0, 0.3), 0px 4px 0px 0px rgba(255, 44, 77, 1), 0px 2px 0px 0px rgba(191, 36, 60, 1), inset -1px -1px 0px 0px rgba(224, 34, 64, 1), inset 1px 1px 1px 0px rgba(252, 105, 128, 1)',
        'multi-green':
          '0px 2px 4px 0px rgba(13, 74, 46, 1), 0px 3px 0px 0px rgba(0, 169, 92, 1), 0px 2px 0px 0px rgba(0, 96, 52, 1), inset -1px -1px 0px 0px rgba(1, 128, 70, 1), inset 1px 1px 1px 0px rgba(101, 205, 152, 1)',
        'inset-dark':
          'inset 0px 1px 1px 0px rgba(47, 46, 56, 1), inset 0px -1px 1px 0px rgba(26, 24, 30, 1)',
        'inset-purple':
          'inset 0.85px 0.8px 1px 0px rgba(175, 127, 250, 1), inset -0.7px -1px 0.5px 0px rgba(99, 35, 189, 1)',
        'inner-purple': 'inset 0.75px 1px 2px 0px rgba(176, 143, 255, 1), inset -1.25px -1.7px 1px 0px rgba(81, 29, 153, 1)',
      },
    },
    screens: {
      'pc': '1440px',
    },
  },
  plugins: [require('tailwindcss-animate')],
}
