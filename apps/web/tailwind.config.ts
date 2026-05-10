import type { Config } from 'tailwindcss';

/**
 * Afrione theme — derived from the wallet home mockup.
 *
 * Surfaces:
 *   parchment ........ page background (warm cream)
 *   ink .............. deepest forest green used on the AFRi card and headings
 *   gold ............. amber accent for AFRi branding, rate badge, primary CTAs
 *   sage ............. cool mint used for xGHS / "Bank of Ghana licensed" pill
 *   sand ............. pale gold used on the "Sent to ..." transaction row pill
 *
 * Text:
 *   ink-900 (body headings) / muted-600 (subtle) / muted-500 (meta)
 */
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        /* === Brand (forest green) === */
        brand: {
          50:  '#EEF1EA',
          100: '#D6DECD',
          200: '#AFBFA0',
          300: '#849C75',
          400: '#577B53',
          500: '#2F4A33',
          600: '#243A28',   // AFRi card body
          700: '#1E2F22',   // AFRi card surface (primary "ink")
          800: '#162319',
          900: '#0F1A12',
        },

        /* === Gold (amber accent) === */
        gold: {
          50:  '#FDF8EE',
          100: '#F9ECD1',
          200: '#F2DCA6',
          300: '#E6C57A',
          400: '#C9A04B',
          500: '#B9893A',   // primary gold
          600: '#9C7129',
          700: '#7C5920',
        },

        /* === Sage (cool mint / cedi accent) === */
        sage: {
          50:  '#F1F4EE',
          100: '#E1E8DB',
          200: '#CDD8C4',   // xGHS row + reserve badges
          300: '#B0C0A4',
          400: '#8AA078',
          500: '#647F52',
        },

        /* === Sand (warm pale gold for transaction icons) === */
        sand: {
          50:  '#FBF5E8',
          100: '#F4E8CB',   // "Sent" tx row pill
          200: '#E9D6A5',
          300: '#D9BC78',
        },

        /* === Surfaces & text === */
        parchment: '#EFE9DD',   // page bg
        cream:     '#F4EFE3',   // legacy alias (kept for back-compat)
        ink:       '#1E2F22',   // brand-700 alias for text-on-cream headings
        body:      '#3A3E37',
        muted: {
          50:  '#F7F5EE',
          100: '#ECE7DA',
          200: '#D9D4C5',
          300: '#B9B3A2',
          400: '#8A8576',
          500: '#6E6A5E',   // .subtle
          600: '#55524A',
          700: '#3F3D37',
        },

        /* === Semantic === */
        success: { 50: '#E9F2EA', 500: '#3F7A45', 700: '#1F5326' },
        warn:    { 50: '#FDF3E1', 500: '#C07F3E', 700: '#7A4A18' },
        danger:  { 50: '#FBEAEA', 500: '#B83A3A', 700: '#7A1F1F' },
      },

      fontFamily: {
        sans:    ['var(--font-sans)',    'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },

      fontSize: {
        // big balance numeral used on the AFRi card
        balance: ['44px', { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '600' }],
      },

      borderRadius: {
        xl2: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.75rem',
        '4xl': '2rem',     // wallet card radius
        pill: '999px',
      },

      boxShadow: {
        card:    '0 1px 2px rgba(31, 47, 34, 0.04), 0 6px 18px rgba(31, 47, 34, 0.05)',
        wallet:  '0 8px 28px rgba(15, 26, 18, 0.20)',
        pop:     '0 1px 2px rgba(0,0,0,0.04)',
        inset:   'inset 0 0 0 1px rgba(31,47,34,0.06)',
      },

      screens: {
        xs: '375px',
      },
    },
  },
  plugins: [],
};

export default config;
