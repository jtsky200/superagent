import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps {
  value: number; // 0-100
  className?: string;
}

/**
 * Minimal progress bar component to satisfy compile-time imports.
 * Replace with a full implementation later.
 */
export const Progress: React.FC<ProgressProps> = ({ value, className }) => {
  const percentage = Math.min(100, Math.max(0, value));
  return (
    <div className={cn('w-full h-2 bg-gray-200 rounded', className)} aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100} role="progressbar">
      <div className="h-full bg-blue-600 rounded" style={{ width: `${percentage}%` }} />
    </div>
  );
};

export default Progress;
