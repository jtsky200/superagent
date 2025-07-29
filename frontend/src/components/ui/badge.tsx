import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'error';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
          default: "bg-gray-900 text-white",
    secondary: "bg-gray-100 text-gray-900",
    outline: "border border-gray-300 text-gray-900",
          success: "bg-green-600 text-white",
      warning: "bg-yellow-600 text-white",
      error: "bg-red-600 text-white"
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };

