/**
 * Global Design Tokens
 * This is the single source of truth for all colors, spacing, and typography.
 * Change colors here and they automatically update throughout the entire app!
 */

export const COLORS = {
  // Primary Brand Color — Airbnb Rausch Coral-Pink (#FF385C)
  primary: {
    50: 'var(--color-primary-50)',
    100: 'var(--color-primary-100)',
    200: 'var(--color-primary-200)',
    300: 'var(--color-primary-300)',
    400: 'var(--color-primary-400)',
    500: 'var(--color-primary-500)',
    600: 'var(--color-primary-600)',
    700: 'var(--color-primary-700)',
    800: 'var(--color-primary-800)',
    900: 'var(--color-primary-900)',
  },

  // Secondary — Ink Black (#222222)
  secondary: {
    50: 'var(--color-secondary-50)',
    100: 'var(--color-secondary-100)',
    200: 'var(--color-secondary-200)',
    300: 'var(--color-secondary-300)',
    400: 'var(--color-secondary-400)',
    500: 'var(--color-secondary-500)',
    600: 'var(--color-secondary-600)',
    700: 'var(--color-secondary-700)',
    800: 'var(--color-secondary-800)',
    900: 'var(--color-secondary-900)',
  },

  // Semantic Colors
  success: {
    DEFAULT: 'var(--color-success)',
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',
    600: 'var(--color-success)',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },
  warning: {
    DEFAULT: 'var(--color-warning)',
    50: '#FCF3DC',
    100: '#FEF3C7',
    500: 'var(--color-warning)',
    600: '#B45309',
  },
  error: {
    DEFAULT: 'var(--color-error)',
    50: '#FFF1F0',
    100: '#FEE2E2',
    500: 'var(--color-error)',
    600: '#B45309',
  },
  info: {
    DEFAULT: 'var(--color-info)',
    50: '#EFF6FF',
    100: '#DBEAFE',
    500: 'var(--color-info)',
    600: '#2563EB',
  },

  // Neutral Colors — Canvas / Cloud / Hairline
  slate: {
    50: 'var(--color-slate-50)',
    100: 'var(--color-slate-100)',
    200: 'var(--color-slate-200)',
    300: 'var(--color-slate-300)',
    400: 'var(--color-slate-400)',
    500: 'var(--color-slate-500)',
    600: 'var(--color-slate-600)',
    700: 'var(--color-slate-700)',
    800: 'var(--color-slate-800)',
    900: 'var(--color-slate-900)',
    950: 'var(--color-slate-950)',
  },

  // Background Colors
  background: {
    light: 'var(--bg-light)',
    dark: 'var(--bg-dark)',
    darker: 'var(--bg-darker)',
  },

  // Text Colors
  text: {
    light: 'var(--text-light)',
    lightSecondary: 'var(--text-light-secondary)',
    dark: 'var(--text-dark)',
    darkSecondary: 'var(--text-dark-secondary)',
  },

  // Border Colors
  border: {
    light: 'var(--border-light)',
    dark: 'var(--border-dark)',
  },
} as const;

export const SPACING = {
  xs: '0.25rem',  // 4px
  sm: '0.5rem',   // 8px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
  '2xl': '2.5rem', // 40px
  '3xl': '3rem',  // 48px
  '4xl': '4rem',  // 64px
} as const;

export const TYPOGRAPHY = {
  // Font sizes
  sizes: {
    xs: '12px',
    sm: '13px',
    base: '14px',
    lg: '15px',
    xl: '16px',
    '2xl': '18px',
    '3xl': '20px',
    '4xl': '24px',
    '5xl': '28px',
    '6xl': '32px',
    '7xl': '36px',
    '8xl': '44px',
    '9xl': '48px',
  },
  // Font weights
  weights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  // Line heights
  lineHeights: {
    tight: 1.1,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
  },
} as const;

export const RADIUS = {
  none: '0',
  sm: '0.375rem',  // 6px
  md: '0.5rem',    // 8px - Button default
  lg: '0.75rem',   // 12px - Card default
  xl: '1rem',      // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px',  // Pills/badges
} as const;

export const SHADOWS = {
  none: 'none',
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px rgba(0, 0, 0, 0.15)',
  inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)',
} as const;

export const TRANSITIONS = {
  fast: '150ms ease-out',
  base: '200ms ease-out',
  slow: '300ms ease-out',
  slower: '500ms ease-out',
} as const;

/**
 * USAGE GUIDE:
 * 
 * 1. To change PRIMARY COLOR globally:
 *    - Update COLORS.primary.600 value
 *    - Update COLORS.primary other shades if needed
 *    - All components automatically update!
 * 
 * 2. In components, use like this:
 *    className={`bg-[${COLORS.primary[600]}]`}
 *    Or better - use Tailwind with CSS variables (see next section)
 * 
 * 3. Alternative: Use CSS variables in globals.css
 *    :root {
 *      --color-primary-600: #16a34a;
 *      --color-primary-700: #15803d;
 *    }
 *    Then: className="bg-[var(--color-primary-600)]"
 */

// Export a hook for easy access in components
export function useDesignTokens() {
  return {
    colors: COLORS,
    spacing: SPACING,
    typography: TYPOGRAPHY,
    radius: RADIUS,
    shadows: SHADOWS,
    transitions: TRANSITIONS,
  };
}

// Helper function to get color with fallback
export function getColor(
  colorPath: keyof typeof COLORS,
  shade?: keyof typeof COLORS.primary
): string {
  const color = COLORS[colorPath] as any;
  if (typeof color === 'string') return color;
  if (shade && color[shade]) return color[shade];
  return color[600] as string;
}
