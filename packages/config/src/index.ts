/**
 * Silk Road Drive — shared design tokens.
 * Single source of truth for the palette + type, extracted from the delivered
 * `.dc.html` designs. Consumed by the Tailwind theme (web) and the MUI theme (admin).
 */

export const colors = {
  bg: '#0A1A24', // page background (storefront)
  bgAdmin: '#091820', // page background (vendor console)
  bg2: '#0C2029', // alt background / sections
  surf: '#102C38', // card / surface
  surf2: '#163A47', // raised surface
  gold: '#E0A93B', // PRIMARY accent — CTAs, prices, active state
  teal: '#2BB8AD', // secondary accent
  blue: '#3AA0D6', // tertiary accent
  cream: '#F3EEE2', // primary text
  muted: '#93A8B0', // muted text (storefront)
  mutedAdmin: '#8DA2AA', // muted text (admin)
  rose: '#D98C6A', // danger / maintenance / high-priority
  line: 'rgba(226,221,206,0.12)', // borders (storefront)
  lineAdmin: 'rgba(226,221,206,0.11)', // borders (admin)
} as const;

/** Operational status colors + labels used in the vendor console. */
export const statusColors = {
  available: { label: 'Available', fg: '#3ECABB', bg: 'rgba(43,184,173,0.15)', dot: '#2BB8AD' },
  rented: { label: 'Rented', fg: '#7CC6ED', bg: 'rgba(58,160,214,0.16)', dot: '#3AA0D6' },
  cleaning: { label: 'Cleaning', fg: '#ECB65E', bg: 'rgba(224,169,59,0.16)', dot: '#E0A93B' },
  maintenance: { label: 'Maintenance', fg: '#E6A684', bg: 'rgba(217,140,106,0.17)', dot: '#D98C6A' },
} as const;

export const fonts = {
  display: "'Bricolage Grotesque', sans-serif", // headings
  body: "'Manrope', system-ui, sans-serif", // body / UI
  mono: 'ui-monospace, monospace', // eyebrows, plates, captions
} as const;

export const radius = {
  sm: '9px',
  md: '11px',
  lg: '14px',
  xl: '16px',
  '2xl': '20px',
} as const;

export const fontFamilyLinks = {
  googleFonts:
    'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Manrope:wght@400;500;600;700&display=swap',
} as const;

export type Colors = typeof colors;
