// Design System Spacing Tokens
// Based on 8px grid system for consistency and mathematical relationships

export const spacing = {
  // Base spacing scale (8px base unit)
  0: '0',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px (base unit)
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  11: '2.75rem',    // 44px
  12: '3rem',       // 48px
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  28: '7rem',       // 112px
  32: '8rem',       // 128px
  36: '9rem',       // 144px
  40: '10rem',      // 160px
  44: '11rem',      // 176px
  48: '12rem',      // 192px
  52: '13rem',      // 208px
  56: '14rem',      // 224px
  60: '15rem',      // 240px
  64: '16rem',      // 256px
  72: '18rem',      // 288px
  80: '20rem',      // 320px
  96: '24rem',      // 384px
} as const;

// Semantic spacing for specific use cases
export const semanticSpacing = {
  // Component internal spacing
  component: {
    xs: spacing[1],      // 4px - tight internal spacing
    sm: spacing[2],      // 8px - small internal spacing
    md: spacing[4],      // 16px - medium internal spacing
    lg: spacing[6],      // 24px - large internal spacing
    xl: spacing[8],      // 32px - extra large internal spacing
  },

  // Layout spacing
  layout: {
    xs: spacing[4],      // 16px - tight layout spacing
    sm: spacing[6],      // 24px - small layout spacing
    md: spacing[8],      // 32px - medium layout spacing
    lg: spacing[12],     // 48px - large layout spacing
    xl: spacing[16],     // 64px - extra large layout spacing
    '2xl': spacing[24],  // 96px - section spacing
    '3xl': spacing[32],  // 128px - page spacing
  },

  // Interactive element spacing
  interactive: {
    button: {
      padding: {
        sm: `${spacing[2]} ${spacing[3]}`,     // 8px 12px
        md: `${spacing[2.5]} ${spacing[4]}`,   // 10px 16px
        lg: `${spacing[3]} ${spacing[6]}`,     // 12px 24px
      },
      gap: spacing[2],                         // 8px between button elements
    },
    input: {
      padding: `${spacing[2.5]} ${spacing[3]}`, // 10px 12px
      gap: spacing[1],                          // 4px between input elements
    },
    card: {
      padding: {
        sm: spacing[4],                        // 16px
        md: spacing[6],                        // 24px
        lg: spacing[8],                        // 32px
      },
      gap: spacing[4],                         // 16px between card elements
    },
  },

  // Typography spacing
  typography: {
    paragraph: spacing[4],                     // 16px between paragraphs
    heading: {
      marginTop: spacing[8],                   // 32px before headings
      marginBottom: spacing[4],                // 16px after headings
    },
    list: {
      gap: spacing[2],                         // 8px between list items
      indent: spacing[6],                      // 24px list indentation
    },
  },

  // Grid and container spacing
  grid: {
    gap: {
      xs: spacing[2],                          // 8px
      sm: spacing[4],                          // 16px
      md: spacing[6],                          // 24px
      lg: spacing[8],                          // 32px
    },
    container: {
      padding: {
        mobile: spacing[4],                    // 16px on mobile
        tablet: spacing[6],                    // 24px on tablet
        desktop: spacing[8],                   // 32px on desktop
      },
      maxWidth: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
    },
  },
} as const;

// Touch target spacing (accessibility)
export const touchTargets = {
  minimum: spacing[11],                        // 44px - WCAG minimum
  comfortable: spacing[12],                    // 48px - comfortable touch
  spacious: spacing[14],                       // 56px - spacious touch
  
  // Spacing between touch targets
  gap: {
    minimum: spacing[2],                       // 8px minimum gap
    comfortable: spacing[4],                   // 16px comfortable gap
  },
} as const;

// Responsive spacing utilities
export const responsiveSpacing = {
  // Fluid spacing that adapts to viewport
  fluid: {
    section: 'clamp(2rem, 8vw, 8rem)',       // Section spacing
    container: 'clamp(1rem, 4vw, 2rem)',     // Container padding
    gap: 'clamp(0.5rem, 2vw, 1.5rem)',       // Element gaps
  },

  // Breakpoint-specific spacing
  breakpoints: {
    mobile: {
      container: spacing[4],                   // 16px
      section: spacing[8],                     // 32px
      element: spacing[2],                     // 8px
    },
    tablet: {
      container: spacing[6],                   // 24px
      section: spacing[12],                    // 48px
      element: spacing[4],                     // 16px
    },
    desktop: {
      container: spacing[8],                   // 32px
      section: spacing[16],                    // 64px
      element: spacing[6],                     // 24px
    },
  },
} as const;

// Animation and transition spacing
export const animationSpacing = {
  // Offset values for animations
  offset: {
    xs: spacing[1],                            // 4px
    sm: spacing[2],                            // 8px
    md: spacing[4],                            // 16px
    lg: spacing[8],                            // 32px
  },
  
  // Slide distances
  slide: {
    sm: spacing[4],                            // 16px
    md: spacing[8],                            // 32px
    lg: spacing[16],                           // 64px
  },
} as const;

// Z-index scale for layering
export const zIndex = {
  auto: 'auto',
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  
  // Semantic z-index values
  dropdown: '1000',
  sticky: '1020',
  fixed: '1030',
  modal: '1040',
  popover: '1050',
  tooltip: '1060',
  notification: '1070',
} as const;

// CSS Custom Properties for spacing
export const spacingCSSVars = {
  '--spacing-xs': semanticSpacing.component.xs,
  '--spacing-sm': semanticSpacing.component.sm,
  '--spacing-md': semanticSpacing.component.md,
  '--spacing-lg': semanticSpacing.component.lg,
  '--spacing-xl': semanticSpacing.component.xl,
  
  '--layout-xs': semanticSpacing.layout.xs,
  '--layout-sm': semanticSpacing.layout.sm,
  '--layout-md': semanticSpacing.layout.md,
  '--layout-lg': semanticSpacing.layout.lg,
  '--layout-xl': semanticSpacing.layout.xl,
  
  '--touch-target-min': touchTargets.minimum,
  '--touch-target-comfortable': touchTargets.comfortable,
  '--touch-gap-min': touchTargets.gap.minimum,
  
  '--container-padding-mobile': responsiveSpacing.breakpoints.mobile.container,
  '--container-padding-tablet': responsiveSpacing.breakpoints.tablet.container,
  '--container-padding-desktop': responsiveSpacing.breakpoints.desktop.container,
} as const;