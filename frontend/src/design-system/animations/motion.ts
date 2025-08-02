// Design System Animation Tokens and Utilities
// Subtle, accessible animations that enhance UX without being distracting

export const animations = {
  // Timing functions (easing curves)
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    
    // Custom cubic-bezier curves for more refined animations
    sharp: 'cubic-bezier(0.4, 0.0, 0.6, 1)', // Sharp entrance/exit
    smooth: 'cubic-bezier(0.4, 0.0, 0.2, 1)', // Smooth deceleration
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Gentle bounce
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Spring-like
  },

  // Duration tokens
  duration: {
    fastest: '100ms',
    fast: '200ms',
    normal: '300ms',
    slow: '500ms',
    slowest: '700ms',
  },

  // Delay tokens for staggered animations
  delay: {
    none: '0ms',
    xs: '50ms',
    sm: '100ms',
    md: '200ms',
    lg: '300ms',
    xl: '500ms',
  },
} as const;

// Animation presets for common UI patterns
export const animationPresets = {
  // Entrance animations
  entrance: {
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 },
      duration: animations.duration.normal,
      easing: animations.easing.easeOut,
    },
    slideInUp: {
      from: { opacity: 0, transform: 'translateY(16px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
      duration: animations.duration.normal,
      easing: animations.easing.smooth,
    },
    slideInDown: {
      from: { opacity: 0, transform: 'translateY(-16px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
      duration: animations.duration.normal,
      easing: animations.easing.smooth,
    },
    slideInLeft: {
      from: { opacity: 0, transform: 'translateX(-16px)' },
      to: { opacity: 1, transform: 'translateX(0)' },
      duration: animations.duration.normal,
      easing: animations.easing.smooth,
    },
    slideInRight: {
      from: { opacity: 0, transform: 'translateX(16px)' },
      to: { opacity: 1, transform: 'translateX(0)' },
      duration: animations.duration.normal,
      easing: animations.easing.smooth,
    },
    scaleIn: {
      from: { opacity: 0, transform: 'scale(0.95)' },
      to: { opacity: 1, transform: 'scale(1)' },
      duration: animations.duration.fast,
      easing: animations.easing.smooth,
    },
  },

  // Exit animations
  exit: {
    fadeOut: {
      from: { opacity: 1 },
      to: { opacity: 0 },
      duration: animations.duration.fast,
      easing: animations.easing.easeIn,
    },
    slideOutUp: {
      from: { opacity: 1, transform: 'translateY(0)' },
      to: { opacity: 0, transform: 'translateY(-16px)' },
      duration: animations.duration.fast,
      easing: animations.easing.easeIn,
    },
    slideOutDown: {
      from: { opacity: 1, transform: 'translateY(0)' },
      to: { opacity: 0, transform: 'translateY(16px)' },
      duration: animations.duration.fast,
      easing: animations.easing.easeIn,
    },
    scaleOut: {
      from: { opacity: 1, transform: 'scale(1)' },
      to: { opacity: 0, transform: 'scale(0.95)' },
      duration: animations.duration.fast,
      easing: animations.easing.easeIn,
    },
  },

  // Interactive states
  interactive: {
    hover: {
      duration: animations.duration.fastest,
      easing: animations.easing.easeOut,
      properties: ['transform', 'box-shadow', 'background-color', 'border-color'],
    },
    focus: {
      duration: animations.duration.fast,
      easing: animations.easing.easeOut,
      properties: ['box-shadow', 'border-color'],
    },
    press: {
      duration: animations.duration.fastest,
      easing: animations.easing.easeInOut,
      properties: ['transform', 'box-shadow'],
    },
  },

  // Loading states
  loading: {
    spin: {
      animation: 'spin 1s linear infinite',
      duration: '1s',
      iterationCount: 'infinite',
      timingFunction: animations.easing.linear,
    },
    pulse: {
      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      duration: '2s',
      iterationCount: 'infinite',
      timingFunction: animations.easing.easeInOut,
    },
    bounce: {
      animation: 'bounce 1s infinite',
      duration: '1s',
      iterationCount: 'infinite',
      timingFunction: animations.easing.easeInOut,
    },
  },

  // Layout changes
  layout: {
    collapse: {
      duration: animations.duration.normal,
      easing: animations.easing.smooth,
      properties: ['height', 'padding', 'margin'],
    },
    expand: {
      duration: animations.duration.normal,
      easing: animations.easing.smooth,
      properties: ['height', 'padding', 'margin'],
    },
  },
} as const;

// CSS keyframes for custom animations
export const keyframes = {
  // Gentle floating animation
  float: `
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-6px); }
    }
  `,

  // Subtle glow effect
  glow: `
    @keyframes glow {
      0%, 100% { box-shadow: 0 0 5px rgba(14, 165, 233, 0.3); }
      50% { box-shadow: 0 0 20px rgba(14, 165, 233, 0.6); }
    }
  `,

  // Skeleton loading wave
  wave: `
    @keyframes wave {
      0% { transform: translateX(-100%); }
      50% { transform: translateX(100%); }
      100% { transform: translateX(100%); }
    }
  `,

  // Shake animation for errors
  shake: `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
      20%, 40%, 60%, 80% { transform: translateX(2px); }
    }
  `,

  // Scale in animation
  scaleIn: `
    @keyframes scaleIn {
      0% { transform: scale(0.9); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
  `,

  // Slide up animation
  slideUp: `
    @keyframes slideUp {
      0% { transform: translateY(20px); opacity: 0; }
      100% { transform: translateY(0); opacity: 1; }
    }
  `,

  // Ripple effect for buttons
  ripple: `
    @keyframes ripple {
      0% { transform: scale(0); opacity: 1; }
      100% { transform: scale(4); opacity: 0; }
    }
  `,
} as const;

// Accessibility-aware animation utilities
export const motionUtilities = {
  // Check if user prefers reduced motion
  prefersReducedMotion: () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  // Apply animation only if motion is allowed
  conditionalAnimate: (animation: string, reducedMotionFallback = 'none') => {
    return motionUtilities.prefersReducedMotion() ? reducedMotionFallback : animation;
  },

  // Create a transition string
  createTransition: (
    properties: string | string[], 
    duration = animations.duration.normal,
    easing = animations.easing.smooth,
    delay = animations.delay.none
  ) => {
    const props = Array.isArray(properties) ? properties : [properties];
    return props.map(prop => `${prop} ${duration} ${easing} ${delay}`).join(', ');
  },

  // Stagger children animations
  staggerChildren: (delay = parseInt(animations.delay.sm)) => {
    return {
      '&:nth-child(1)': { animationDelay: '0ms' },
      '&:nth-child(2)': { animationDelay: `${delay}ms` },
      '&:nth-child(3)': { animationDelay: `${delay * 2}ms` },
      '&:nth-child(4)': { animationDelay: `${delay * 3}ms` },
      '&:nth-child(5)': { animationDelay: `${delay * 4}ms` },
    };
  },
} as const;

// React-specific animation hooks and utilities
export const reactAnimations = {
  // Spring configuration for React Spring
  springs: {
    gentle: { tension: 120, friction: 14 },
    fast: { tension: 280, friction: 20 },
    slow: { tension: 80, friction: 10 },
    bounce: { tension: 300, friction: 10 },
  },

  // Framer Motion variants
  variants: {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          delayChildren: 0.1,
          staggerChildren: 0.05,
        },
      },
    },
    item: {
      hidden: { y: 20, opacity: 0 },
      visible: {
        y: 0,
        opacity: 1,
        transition: {
          duration: 0.3,
          ease: [0.4, 0.0, 0.2, 1],
        },
      },
    },
    fadeInUp: {
      initial: { opacity: 0, y: 16 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -16 },
      transition: { duration: 0.3, ease: [0.4, 0.0, 0.2, 1] },
    },
    scaleInOut: {
      initial: { scale: 0.95, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 0.95, opacity: 0 },
      transition: { duration: 0.2, ease: [0.4, 0.0, 0.2, 1] },
    },
  },
} as const;

// CSS Custom Properties for animations
export const animationCSSVars = {
  '--duration-fastest': animations.duration.fastest,
  '--duration-fast': animations.duration.fast,
  '--duration-normal': animations.duration.normal,
  '--duration-slow': animations.duration.slow,
  '--duration-slowest': animations.duration.slowest,
  
  '--easing-linear': animations.easing.linear,
  '--easing-ease': animations.easing.ease,
  '--easing-ease-in': animations.easing.easeIn,
  '--easing-ease-out': animations.easing.easeOut,
  '--easing-ease-in-out': animations.easing.easeInOut,
  '--easing-sharp': animations.easing.sharp,
  '--easing-smooth': animations.easing.smooth,
  '--easing-bounce': animations.easing.bounce,
  '--easing-spring': animations.easing.spring,
  
  '--delay-xs': animations.delay.xs,
  '--delay-sm': animations.delay.sm,
  '--delay-md': animations.delay.md,
  '--delay-lg': animations.delay.lg,
  '--delay-xl': animations.delay.xl,
} as const;