import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface AccessibilitySettings {
  // Visual accessibility
  highContrast: boolean;
  reducedMotion: boolean;
  largeText: boolean;
  focusIndicators: boolean;
  
  // Interaction accessibility
  stickyFocus: boolean;
  keyboardNavigation: boolean;
  touchAccommodation: boolean;
  
  // Cognitive accessibility
  simplifiedInterface: boolean;
  extendedTimeouts: boolean;
  disableAutoplay: boolean;
  
  // Screen reader support
  announcements: boolean;
  verboseDescriptions: boolean;
}

interface AccessibilityContext {
  settings: AccessibilitySettings;
  updateSetting: (key: keyof AccessibilitySettings, value: boolean) => void;
  resetSettings: () => void;
  
  // Utility functions
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  setFocusToElement: (elementId: string) => void;
  trapFocus: (containerId: string) => () => void;
}

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  reducedMotion: false,
  largeText: false,
  focusIndicators: true,
  stickyFocus: false,
  keyboardNavigation: true,
  touchAccommodation: false,
  simplifiedInterface: false,
  extendedTimeouts: false,
  disableAutoplay: false,
  announcements: true,
  verboseDescriptions: false,
};

const AccessibilityContext = createContext<AccessibilityContext | null>(null);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    // Load settings from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('accessibility-settings');
      if (saved) {
        try {
          return { ...defaultSettings, ...JSON.parse(saved) };
        } catch {
          return defaultSettings;
        }
      }
    }
    return defaultSettings;
  });

  // Auto-detect system preferences
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect reduced motion preference
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      setSettings(prev => ({ ...prev, reducedMotion: e.matches }));
    };
    
    // Set initial value
    if (reducedMotionQuery.matches) {
      setSettings(prev => ({ ...prev, reducedMotion: true }));
    }
    
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);

    // Detect high contrast preference
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    const handleHighContrastChange = (e: MediaQueryListEvent) => {
      setSettings(prev => ({ ...prev, highContrast: e.matches }));
    };
    
    if (highContrastQuery.matches) {
      setSettings(prev => ({ ...prev, highContrast: true }));
    }
    
    highContrastQuery.addEventListener('change', handleHighContrastChange);

    // Detect color scheme preference
    const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    // Could add dark mode support here

    return () => {
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
      highContrastQuery.removeEventListener('change', handleHighContrastChange);
    };
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessibility-settings', JSON.stringify(settings));
    }
  }, [settings]);

  // Apply CSS classes based on settings
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    
    // High contrast
    root.classList.toggle('high-contrast', settings.highContrast);
    
    // Reduced motion
    root.classList.toggle('reduced-motion', settings.reducedMotion);
    
    // Large text
    root.classList.toggle('large-text', settings.largeText);
    
    // Focus indicators
    root.classList.toggle('enhanced-focus', settings.focusIndicators);
    
    // Touch accommodation
    root.classList.toggle('touch-accommodation', settings.touchAccommodation);
    
    // Simplified interface
    root.classList.toggle('simplified-interface', settings.simplifiedInterface);
  }, [settings]);

  const updateSetting = useCallback((key: keyof AccessibilitySettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  // Announcement function for screen readers
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!settings.announcements) return;

    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, [settings.announcements]);

  // Focus management
  const setFocusToElement = useCallback((elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.focus();
      
      // Announce focus change for screen readers
      if (settings.announcements) {
        const label = element.getAttribute('aria-label') || 
                     element.getAttribute('title') ||
                     element.textContent ||
                     'Element';
        announce(`Focused on ${label}`);
      }
    }
  }, [announce, settings.announcements]);

  // Focus trap utility
  const trapFocus = useCallback((containerId: string) => {
    const container = document.getElementById(containerId);
    if (!container) return () => {};

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    
    // Set initial focus
    if (firstElement) {
      firstElement.focus();
    }

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, []);

  const contextValue: AccessibilityContext = {
    settings,
    updateSetting,
    resetSettings,
    announce,
    setFocusToElement,
    trapFocus,
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}

// Screen reader only component
export function ScreenReaderOnly({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className="sr-only" {...props}>
      {children}
    </span>
  );
}

// Skip link component for keyboard navigation
export function SkipLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-md focus:shadow-lg transition-all"
    >
      {children}
    </a>
  );
}

// Landmark component for better screen reader navigation
export function Landmark({ 
  as: Component = 'div', 
  role, 
  ariaLabel, 
  children, 
  ...props 
}: {
  as?: React.ElementType;
  role?: string;
  ariaLabel?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <Component
      role={role}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </Component>
  );
}

// Focus management hook
export function useFocusManagement() {
  const { setFocusToElement, trapFocus } = useAccessibility();
  
  return {
    setFocus: setFocusToElement,
    trapFocus,
    
    // Return focus to previous element
    returnFocus: useCallback((previousElementId?: string) => {
      if (previousElementId) {
        setFocusToElement(previousElementId);
      }
    }, [setFocusToElement]),
    
    // Focus first error in a form
    focusFirstError: useCallback(() => {
      const firstError = document.querySelector('[aria-invalid="true"]') as HTMLElement;
      if (firstError) {
        firstError.focus();
      }
    }, []),
  };
}