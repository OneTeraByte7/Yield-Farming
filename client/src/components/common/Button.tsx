import React from 'react';
import { cn } from '@/utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = 'font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed will-change-transform';

  const variants = {
    primary: 'bg-[#0610ac] text-white hover:bg-[#050d8a] active:scale-[0.98]',
    secondary: 'bg-white dark:bg-[#1a1a1f] text-[#1a1a1a] dark:text-[#f8fafc] hover:bg-[#fafbfc] dark:hover:bg-[#0d0d12] active:scale-[0.98] border border-[#e8e8e8] dark:border-[#2a2a2f]',
    outline: 'border border-[#e8e8e8] text-[#1a1a1a] dark:text-[#f8fafc] hover:bg-[#fafbfc] dark:hover:bg-[#1a1a1f] active:scale-[0.98]',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:scale-[0.98]',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-2.5 text-[0.9375rem]',
    lg: 'px-8 py-3.5 text-base',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  );
};