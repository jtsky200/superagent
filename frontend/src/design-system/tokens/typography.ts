// Design System Typography Tokens
// Optimized for readability and accessibility

export const typography = {
  // Font Families
  fontFamily: {
    sans: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ],
    mono: [
      '"SF Mono"',
      'Monaco',
      'Inconsolata',
      '"Roboto Mono"',
      '"Source Code Pro"',
      'monospace',
    ],
    brand: [
      '"Cadillac Sans"', // Custom brand font if available
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      'sans-serif',
    ],
  },

  // Font Weights
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },

  // Font Sizes (using rem for accessibility)
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
    '7xl': '4.5rem',  // 72px
    '8xl': '6rem',    // 96px
  },

  // Line Heights (optimized for readability)
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },

  // Letter Spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

// Typography Scale Definitions
export const typographyScale = {
  // Display text (for heroes, major headings)
  display: {
    large: {
      fontSize: typography.fontSize['6xl'],
      lineHeight: typography.lineHeight.tight,
      fontWeight: typography.fontWeight.bold,
      letterSpacing: typography.letterSpacing.tight,
    },
    medium: {
      fontSize: typography.fontSize['5xl'],
      lineHeight: typography.lineHeight.tight,
      fontWeight: typography.fontWeight.bold,
      letterSpacing: typography.letterSpacing.tight,
    },
    small: {
      fontSize: typography.fontSize['4xl'],
      lineHeight: typography.lineHeight.snug,
      fontWeight: typography.fontWeight.semibold,
      letterSpacing: typography.letterSpacing.normal,
    },
  },

  // Headings
  heading: {
    h1: {
      fontSize: typography.fontSize['3xl'],
      lineHeight: typography.lineHeight.snug,
      fontWeight: typography.fontWeight.bold,
      letterSpacing: typography.letterSpacing.tight,
    },
    h2: {
      fontSize: typography.fontSize['2xl'],
      lineHeight: typography.lineHeight.snug,
      fontWeight: typography.fontWeight.semibold,
      letterSpacing: typography.letterSpacing.normal,
    },
    h3: {
      fontSize: typography.fontSize.xl,
      lineHeight: typography.lineHeight.snug,
      fontWeight: typography.fontWeight.semibold,
      letterSpacing: typography.letterSpacing.normal,
    },
    h4: {
      fontSize: typography.fontSize.lg,
      lineHeight: typography.lineHeight.normal,
      fontWeight: typography.fontWeight.medium,
      letterSpacing: typography.letterSpacing.normal,
    },
    h5: {
      fontSize: typography.fontSize.base,
      lineHeight: typography.lineHeight.normal,
      fontWeight: typography.fontWeight.medium,
      letterSpacing: typography.letterSpacing.normal,
    },
    h6: {
      fontSize: typography.fontSize.sm,
      lineHeight: typography.lineHeight.normal,
      fontWeight: typography.fontWeight.medium,
      letterSpacing: typography.letterSpacing.wide,
    },
  },

  // Body text
  body: {
    large: {
      fontSize: typography.fontSize.lg,
      lineHeight: typography.lineHeight.relaxed,
      fontWeight: typography.fontWeight.normal,
      letterSpacing: typography.letterSpacing.normal,
    },
    medium: {
      fontSize: typography.fontSize.base,
      lineHeight: typography.lineHeight.normal,
      fontWeight: typography.fontWeight.normal,
      letterSpacing: typography.letterSpacing.normal,
    },
    small: {
      fontSize: typography.fontSize.sm,
      lineHeight: typography.lineHeight.normal,
      fontWeight: typography.fontWeight.normal,
      letterSpacing: typography.letterSpacing.normal,
    },
  },

  // Labels and UI text
  label: {
    large: {
      fontSize: typography.fontSize.base,
      lineHeight: typography.lineHeight.normal,
      fontWeight: typography.fontWeight.medium,
      letterSpacing: typography.letterSpacing.normal,
    },
    medium: {
      fontSize: typography.fontSize.sm,
      lineHeight: typography.lineHeight.normal,
      fontWeight: typography.fontWeight.medium,
      letterSpacing: typography.letterSpacing.wide,
    },
    small: {
      fontSize: typography.fontSize.xs,
      lineHeight: typography.lineHeight.normal,
      fontWeight: typography.fontWeight.medium,
      letterSpacing: typography.letterSpacing.wide,
    },
  },

  // Code and monospace
  code: {
    large: {
      fontSize: typography.fontSize.base,
      lineHeight: typography.lineHeight.normal,
      fontWeight: typography.fontWeight.normal,
      fontFamily: typography.fontFamily.mono.join(', '),
    },
    medium: {
      fontSize: typography.fontSize.sm,
      lineHeight: typography.lineHeight.normal,
      fontWeight: typography.fontWeight.normal,
      fontFamily: typography.fontFamily.mono.join(', '),
    },
    small: {
      fontSize: typography.fontSize.xs,
      lineHeight: typography.lineHeight.normal,
      fontWeight: typography.fontWeight.normal,
      fontFamily: typography.fontFamily.mono.join(', '),
    },
  },
} as const;

// Responsive typography utilities
export const responsiveTypography = {
  // Fluid typography that scales with viewport
  fluid: {
    display: {
      fontSize: 'clamp(2.25rem, 4vw, 4.5rem)',
      lineHeight: typography.lineHeight.tight,
    },
    heading: {
      fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
      lineHeight: typography.lineHeight.snug,
    },
    body: {
      fontSize: 'clamp(0.875rem, 1.5vw, 1.125rem)',
      lineHeight: typography.lineHeight.normal,
    },
  },

  // Breakpoint-specific typography
  breakpoints: {
    mobile: {
      display: typography.fontSize['3xl'],
      heading: typography.fontSize.xl,
      body: typography.fontSize.sm,
    },
    tablet: {
      display: typography.fontSize['4xl'],
      heading: typography.fontSize['2xl'],
      body: typography.fontSize.base,
    },
    desktop: {
      display: typography.fontSize['5xl'],
      heading: typography.fontSize['3xl'],
      body: typography.fontSize.lg,
    },
  },
} as const;

// Accessibility utilities
export const typographyAccessibility = {
  // Minimum sizes for readability
  minimumSizes: {
    body: '16px',
    interactive: '16px', // For buttons, links
    touch: '44px', // Minimum touch target size
  },

  // High contrast text combinations
  highContrast: {
    lightBackground: '#000000',
    darkBackground: '#ffffff',
    coloredBackground: '#ffffff',
  },

  // Reading optimized settings
  readingOptimized: {
    lineHeight: typography.lineHeight.relaxed,
    letterSpacing: typography.letterSpacing.wide,
    wordSpacing: '0.1em',
    paragraphSpacing: '1.5em',
  },
} as const;

// CSS Custom Properties for typography
export const typographyCSSVars = {
  '--font-family-sans': typography.fontFamily.sans.join(', '),
  '--font-family-mono': typography.fontFamily.mono.join(', '),
  '--font-family-brand': typography.fontFamily.brand.join(', '),
  
  '--font-size-xs': typography.fontSize.xs,
  '--font-size-sm': typography.fontSize.sm,
  '--font-size-base': typography.fontSize.base,
  '--font-size-lg': typography.fontSize.lg,
  '--font-size-xl': typography.fontSize.xl,
  '--font-size-2xl': typography.fontSize['2xl'],
  '--font-size-3xl': typography.fontSize['3xl'],
  '--font-size-4xl': typography.fontSize['4xl'],
  
  '--line-height-tight': typography.lineHeight.tight,
  '--line-height-normal': typography.lineHeight.normal,
  '--line-height-relaxed': typography.lineHeight.relaxed,
  
  '--letter-spacing-tight': typography.letterSpacing.tight,
  '--letter-spacing-normal': typography.letterSpacing.normal,
  '--letter-spacing-wide': typography.letterSpacing.wide,
} as const;