import type { Config } from 'tailwindcss';

// Tokens mirror packages/config (the design source of truth).
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0A1A24',
        bg2: '#0C2029',
        surf: '#102C38',
        surf2: '#163A47',
        gold: '#E0A93B',
        teal: '#2BB8AD',
        blue: '#3AA0D6',
        cream: '#F3EEE2',
        muted: '#93A8B0',
        rose: '#D98C6A',
        line: 'rgba(226,221,206,0.12)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Bricolage Grotesque', 'sans-serif'],
        body: ['var(--font-body)', 'Manrope', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'monospace'],
      },
      borderColor: {
        DEFAULT: 'rgba(226,221,206,0.12)',
      },
    },
  },
  plugins: [],
};

export default config;
