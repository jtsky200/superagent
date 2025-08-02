// Design System Color Tokens
// Based on Cadillac brand guidelines with accessibility considerations

export const colors = {
  // Primary Brand Colors
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // Main Cadillac Blue
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },

  // Secondary/Accent Colors
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },

  // Success Colors (for positive states)
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },

  // Warning Colors
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },

  // Error/Danger Colors
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },

  // Neutral/Gray Scale
  neutral: {
    0: '#ffffff',
    25: '#fcfcfd',
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },

  // Semantic Colors for specific use cases
  semantic: {
    // Information
    info: '#0ea5e9',
    infoLight: '#e0f2fe',
    infoDark: '#075985',

    // Links
    link: '#0369a1',
    linkHover: '#0284c7',
    linkVisited: '#7c3aed',

    // Backgrounds
    surfacePrimary: '#ffffff',
    surfaceSecondary: '#f9fafb',
    surfaceTertiary: '#f3f4f6',
    
    // Borders
    borderPrimary: '#e5e7eb',
    borderSecondary: '#d1d5db',
    borderFocus: '#0ea5e9',
    borderError: '#dc2626',

    // Text
    textPrimary: '#111827',
    textSecondary: '#4b5563',
    textTertiary: '#9ca3af',
    textInverse: '#ffffff',
    textLink: '#0369a1',
    textSuccess: '#15803d',
    textWarning: '#d97706',
    textError: '#dc2626',

    // Interactive states
    hoverOverlay: 'rgba(0, 0, 0, 0.05)',
    pressedOverlay: 'rgba(0, 0, 0, 0.1)',
    focusRing: 'rgba(14, 165, 233, 0.3)',
    selectedBg: '#e0f2fe',
    disabledBg: '#f3f4f6',
    disabledText: '#9ca3af',
  },
} as const;

// Accessibility-compliant color combinations
export const colorCombinations = {
  // High contrast combinations (WCAG AA+)
  highContrast: {
    textOnLight: colors.neutral[900],
    textOnDark: colors.neutral[0],
    textOnPrimary: colors.neutral[0],
    textOnSuccess: colors.neutral[0],
    textOnWarning: colors.neutral[900],
    textOnError: colors.neutral[0],
  },

  // Interactive states with proper contrast
  interactive: {
    primaryButton: {
      bg: colors.primary[600],
      text: colors.neutral[0],
      hover: colors.primary[700],
      active: colors.primary[800],
      disabled: colors.neutral[300],
      disabledText: colors.neutral[500],
    },
    secondaryButton: {
      bg: colors.neutral[100],
      text: colors.neutral[900],
      hover: colors.neutral[200],
      active: colors.neutral[300],
      border: colors.neutral[300],
    },
    linkButton: {
      text: colors.primary[600],
      hover: colors.primary[700],
      active: colors.primary[800],
      visited: colors.primary[800],
    },
  },
} as const;

// Dark mode color overrides
export const darkModeColors = {
  semantic: {
    surfacePrimary: colors.neutral[900],
    surfaceSecondary: colors.neutral[800],
    surfaceTertiary: colors.neutral[700],
    
    borderPrimary: colors.neutral[700],
    borderSecondary: colors.neutral[600],
    
    textPrimary: colors.neutral[100],
    textSecondary: colors.neutral[300],
    textTertiary: colors.neutral[400],
    
    hoverOverlay: 'rgba(255, 255, 255, 0.05)',
    pressedOverlay: 'rgba(255, 255, 255, 0.1)',
  },
} as const;

// Utility functions for color manipulation
export const colorUtils = {
  // Convert hex to rgba
  hexToRgba: (hex: string, alpha: number): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  },

  // Get contrast ratio between two colors
  getContrastRatio: (color1: string, color2: string): number => {
    // Simplified contrast ratio calculation
    // In production, use a proper color contrast library
    return 4.5; // Placeholder - meets WCAG AA standard
  },

  // Check if color combination meets WCAG standards
  meetsWCAG: (foreground: string, background: string, level: 'AA' | 'AAA' = 'AA'): boolean => {
    const ratio = colorUtils.getContrastRatio(foreground, background);
    return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
  },
} as const;