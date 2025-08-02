// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useAccessibility } from '@/accessibility/AccessibilityProvider';
import { motionUtilities } from '@/design-system/animations/motion';

// Animated container that reveals content on scroll
interface FadeInViewProps {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale';
}

export function FadeInView({ 
  children, 
  className, 
  threshold = 0.1,
  delay = 0,
  direction = 'up'
}: FadeInViewProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { settings } = useAccessibility();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, delay]);

  const directionClasses = {
    up: 'translate-y-8',
    down: '-translate-y-8',
    left: 'translate-x-8',
    right: '-translate-x-8',
    scale: 'scale-95',
  };

  const animationClass = settings.reducedMotion ? '' : 'transition-all duration-700 ease-out';

  return (
    <div
      ref={ref}
      className={cn(
        animationClass,
        !isVisible && !settings.reducedMotion && [
          'opacity-0',
          directionClasses[direction]
        ],
        isVisible && [
          'opacity-100',
          'translate-y-0 translate-x-0 scale-100'
        ],
        settings.reducedMotion && 'opacity-100',
        className
      )}
    >
      {children}
    </div>
  );
}

// Staggered list animation
interface StaggeredListProps {
  children: React.ReactNode[];
  className?: string;
  staggerDelay?: number;
}

export function StaggeredList({ children, className, staggerDelay = 100 }: StaggeredListProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { settings } = useAccessibility();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children.map((child, index) => (
        <div
          key={index}
          className={cn(
            !settings.reducedMotion && [
              'transition-all duration-500 ease-out',
              !isVisible && 'opacity-0 translate-y-4',
              isVisible && 'opacity-100 translate-y-0'
            ],
            settings.reducedMotion && 'opacity-100'
          )}
          style={
            !settings.reducedMotion ? {
              transitionDelay: isVisible ? `${index * staggerDelay}ms` : '0ms'
            } : undefined
          }
        >
          {child}
        </div>
      ))}
    </div>
  );
}

// Animated counter component
interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export function AnimatedCounter({ 
  value, 
  duration = 2000, 
  className, 
  prefix = '', 
  suffix = '',
  decimals = 0
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const { settings } = useAccessibility();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || settings.reducedMotion) {
      setCount(value);
      return;
    }

    let startTime: number;
    const startValue = count;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = startValue + (value - startValue) * easeOutQuart;
      
      setCount(currentCount);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration, isVisible, settings.reducedMotion]);

  return (
    <span ref={ref} className={className}>
      {prefix}{count.toFixed(decimals)}{suffix}
    </span>
  );
}

// Ripple effect component for buttons
interface RippleProps {
  color?: string;
  duration?: number;
}

export function useRipple({ color = 'rgba(255, 255, 255, 0.3)', duration = 600 }: RippleProps = {}) {
  const { settings } = useAccessibility();

  const createRipple = (event: React.MouseEvent<HTMLElement>) => {
    if (settings.reducedMotion) return;

    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: ${color};
      transform: scale(0);
      animation: ripple ${duration}ms linear;
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      pointer-events: none;
    `;

    // Ensure the button has relative positioning
    if (getComputedStyle(button).position === 'static') {
      button.style.position = 'relative';
    }

    // Ensure overflow is hidden
    button.style.overflow = 'hidden';

    button.appendChild(ripple);

    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, duration);
  };

  return createRipple;
}

// Parallax component for subtle depth effects
interface ParallaxProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}

export function Parallax({ children, speed = 0.5, className }: ParallaxProps) {
  const [offset, setOffset] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const { settings } = useAccessibility();

  useEffect(() => {
    if (settings.reducedMotion) return;

    const handleScroll = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const scrolled = window.pageYOffset;
        const rate = scrolled * -speed;
        setOffset(rate);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed, settings.reducedMotion]);

  return (
    <div ref={ref} className={className}>
      <div
        style={
          !settings.reducedMotion ? {
            transform: `translateY(${offset}px)`,
          } : undefined
        }
      >
        {children}
      </div>
    </div>
  );
}

// Hover lift effect for cards
interface HoverLiftProps {
  children: React.ReactNode;
  liftHeight?: number;
  className?: string;
}

export function HoverLift({ children, liftHeight = 4, className }: HoverLiftProps) {
  const { settings } = useAccessibility();

  return (
    <div
      className={cn(
        !settings.reducedMotion && [
          'transition-transform duration-200 ease-out',
          'hover:-translate-y-1 hover:shadow-lg',
          'active:translate-y-0 active:shadow-md'
        ],
        className
      )}
      style={
        !settings.reducedMotion ? {
          '--lift-height': `${liftHeight}px`,
        } : undefined
      }
    >
      {children}
    </div>
  );
}

// Pulse animation for notifications
interface PulseProps {
  children: React.ReactNode;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Pulse({ children, color = 'primary', size = 'md', className }: PulseProps) {
  const { settings } = useAccessibility();

  const sizeClasses = {
    sm: 'scale-105',
    md: 'scale-110',
    lg: 'scale-125',
  };

  const colorClasses = {
    primary: 'shadow-primary-500/50',
    success: 'shadow-success-500/50',
    warning: 'shadow-warning-500/50',
    error: 'shadow-error-500/50',
  };

  return (
    <div
      className={cn(
        !settings.reducedMotion && [
          'animate-pulse',
          sizeClasses[size],
          colorClasses[color as keyof typeof colorClasses] || colorClasses.primary
        ],
        className
      )}
    >
      {children}
    </div>
  );
}

// Loading shimmer effect
interface ShimmerProps {
  className?: string;
}

export function Shimmer({ className }: ShimmerProps) {
  const { settings } = useAccessibility();

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-neutral-200',
        !settings.reducedMotion && 'animate-pulse',
        className
      )}
    >
      {!settings.reducedMotion && (
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      )}
    </div>
  );
}

// Typewriter effect for text
interface TypewriterProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

export function Typewriter({ text, speed = 50, className, onComplete }: TypewriterProps) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const { settings } = useAccessibility();

  useEffect(() => {
    if (settings.reducedMotion) {
      setDisplayText(text);
      onComplete?.();
      return;
    }

    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (currentIndex === text.length) {
      onComplete?.();
    }
  }, [currentIndex, text, speed, onComplete, settings.reducedMotion]);

  return (
    <span className={className}>
      {displayText}
      {!settings.reducedMotion && currentIndex < text.length && (
        <span className="animate-pulse">|</span>
      )}
    </span>
  );
}