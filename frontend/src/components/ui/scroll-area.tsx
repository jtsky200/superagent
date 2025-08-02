import React from 'react';
import { cn } from '@/lib/utils';

interface ScrollAreaProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Very simple scrollable container as placeholder.
 */
export const ScrollArea: React.FC<ScrollAreaProps> = ({ children, className, style }) => {
  return (
    <div className={cn('overflow-auto', className)} style={style}>
      {children}
    </div>
  );
};

export default ScrollArea;
