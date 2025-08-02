import React from 'react';
import { cn } from '@/lib/utils';

export interface DropdownMenuProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ children, className }) => {
  return (
    <div className={cn('relative inline-block text-left', className)}>{children}</div>
  );
};

export const DropdownMenuTrigger: React.FC<{ children: React.ReactNode; className?: string; asChild?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className, asChild, ...props }) => {
  if (asChild) {
    return <>{children}</>;
  }
  return (
    <button type="button" className={cn('inline-flex justify-center w-full px-4 py-2 text-sm font-medium', className)} {...props}>
      {children}
    </button>
  );
};

export const DropdownMenuContent: React.FC<{ children: React.ReactNode; className?: string; align?: 'start' | 'end'; } & React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => {
  return (
    <div className={cn('origin-top-right absolute mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none', className)} {...props}>
      {children}
    </div>
  );
};

export const DropdownMenuItem: React.FC<{ children: React.ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => {
  return (
    <div className={cn('px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer', className)} {...props}>
      {children}
    </div>
  );
};

export const DropdownMenuSeparator: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('border-t border-gray-200 my-2', className)} />
);

export const DropdownMenuLabel: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn('px-4 py-2 text-xs text-gray-500', className)}>{children}</div>
);

export default DropdownMenu;
